/*
Don't forget to change the delimiter with
mysql> delimiter //

And change it back to ; with
mysql> delimiter ;
*/
delimiter //

DROP TRIGGER IF EXISTS before_insert_part//
DROP TRIGGER IF EXISTS before_update_part//

CREATE TRIGGER `before_insert_part` BEFORE INSERT ON `Part`
 FOR EACH ROW BEGIN
DECLARE nextId int;
DECLARE startUid varchar(50);

SELECT TRIM(LEADING '0' FROM SUBSTRING(SUBSTRING_INDEX(categoryPath, ' ', 4),17)) FROM `PartCategory`
WHERE NEW.category_id = PartCategory.id INTO startUid;

SELECT AUTO_INCREMENT FROM information_schema.tables WHERE table_name = 'Part' INTO nextId;
	SET New.internalPartNumber = CONCAT_WS('-', startUid, LPAD(nextId, 4, '0'));
end//

CREATE TRIGGER `before_update_part` BEFORE UPDATE ON `Part`
 FOR EACH ROW BEGIN
DECLARE startUid varchar(50);

SELECT TRIM(LEADING '0' FROM SUBSTRING(SUBSTRING_INDEX(categoryPath, ' ', 4),17)) FROM `PartCategory`
WHERE NEW.category_id = PartCategory.id INTO startUid;
if New.internalPartNumber = "" THEN
	SET New.internalPartNumber = CONCAT_WS('-', startUid, LPAD(NEW.Id, 4, '0'));
END IF;
end//

delimiter ;

/*
query to re-run uid computation
UPDATE `Part` 
INNER JOIN `PartCategory` ON `Part`.category_id = `PartCategory`.id
SET internalPartNumber = CONCAT_WS('-', SUBSTRING(`PartCategory`.categoryPath, 17, 1), LPAD(`Part`.Id, 4, '0'));
*/
