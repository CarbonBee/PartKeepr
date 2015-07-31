<?php
namespace PartKeepr\PartBundle\Controller;

use Doctrine\ORM\EntityManager;
use Dunglas\ApiBundle\JsonLd\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class PartMeasurementUnitController extends Controller
{
    public function setDefaultAction(Request $request, $id)
    {
        /**
         * @var $em EntityManager
         */
        $em = $this->get("doctrine")->getEntityManager();

        $em->beginTransaction();

        $resource = $this->getResource($request);
        $this->findOrThrowNotFound($resource, $id);



        $dql = 'UPDATE PartKeepr\PartBundle\Entity\PartMeasurementUnit pu SET pu.isDefault = :default WHERE pu.id = :id';

        $em->createQuery($dql)
            ->setParameter("id", $id)
            ->setParameter(
            "default",
            true,
            \PDO::PARAM_BOOL
        )->execute();

        $dql = 'UPDATE PartKeepr\PartBundle\Entity\PartMeasurementUnit pu SET pu.isDefault = :default WHERE pu.id != :id';

        $em->createQuery($dql)
            ->setParameter("id", $id)
            ->setParameter(
            "default",
            false,
            \PDO::PARAM_BOOL
        )->execute();

        $em->commit();
        return new Response();
    }
}