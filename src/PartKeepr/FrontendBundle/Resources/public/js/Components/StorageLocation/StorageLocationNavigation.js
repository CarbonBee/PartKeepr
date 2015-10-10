Ext.define("PartKeepr.StorageLocationNavigation", {
    extend: 'Ext.panel.Panel',

    layout: 'border',

    /**
     * @var {Ext.data.Store}
     */
    store: null,
    items: [
        {
            xtype: 'partkeepr.StorageLocationTree',
            region: 'center'
        }, {
            xtype: 'partkeepr.StorageLocationGrid',
            resizable: true,
            split: true,
            region: 'south',
            height: "50%",
            viewConfig: {
                plugins: {
                    ddGroup: 'StorageLocationTree',
                    ptype: 'gridviewdragdrop',
                    enableDrop: false
                }
            },
            enableDragDrop: true
        }
    ],

    initComponent: function ()
    {
        this.callParent(arguments);

        this.down("partkeepr\\.StorageLocationTree").on("itemclick", this.onCategoryClick, this);
        this.down("partkeepr\\.StorageLocationGrid").setStore(this.store);

        this.down("partkeepr\\.StorageLocationGrid").on("storageLocationMultiAdd", this.onMultiAddStorageLocation, this);
        this.down("partkeepr\\.StorageLocationGrid").on("itemAdd", this.onAddStorageLocation, this);
        this.down("partkeepr\\.StorageLocationGrid").on("itemDelete", function (id)
            {
                this.fireEvent("itemDelete", id);
            }, this
        );
        this.down("partkeepr\\.StorageLocationGrid").on("itemEdit", function (id)
            {
                this.fireEvent("itemEdit", id);
            }, this
        );

    },
    /**
     * Applies the category filter to the store when a category is selected
     *
     * @param {Ext.tree.View} tree The tree view
     * @param {Ext.data.Model} record the selected record
     */
    onCategoryClick: function (tree, record)
    {
        var filter = Ext.create("Ext.util.Filter", {
            property: 'category',
            operator: 'IN',
            value: this.getChildrenIds(record)
        });

        this.store.addFilter(filter);
    },
    /**
     * Returns the ID for this node and all child nodes
     *
     * @param {Ext.data.Model} The node
     * @return Array
     */
    getChildrenIds: function (node)
    {
        var childNodes = [node.getId()];

        if (node.hasChildNodes()) {
            for (var i = 0; i < node.childNodes.length; i++) {
                childNodes = childNodes.concat(this.getChildrenIds(node.childNodes[i]));
            }
        }

        return childNodes;
    },
    /**
     * Called when a storage location is about to be added. This prepares the to-be-edited record with the proper category id.
     */
    onAddStorageLocation: function ()
    {
        var selection = this.down("partkeepr\\.StorageLocationTree").getSelection();

        var category;
        if (selection.length === 0) {
            category = this.down("partkeepr\\.StorageLocationTree").getRootNode().firstChild.getId();
        } else {
            var item = selection.shift();
            category = item.getId();
        }
        this.fireEvent("itemAdd", {
            category: category
        });
    },
    /**
     * Called when a storage location is about to be added. This prepares the to-be-edited record with the proper category id.
     */
    onMultiAddStorageLocation: function ()
    {
        var selection = this.down("partkeepr\\.StorageLocationTree").getSelection();

        var category;
        if (selection.length === 0) {
            category = this.down("partkeepr\\.StorageLocationTree").getRootNode().firstChild.getId();
        } else {
            var item = selection.shift();
            category = item.getId();
        }

        var j = Ext.create("PartKeepr.StorageLocationMultiCreateWindow", {
            category: category,
            listeners: {
                destroy: {
                    fn: this.onMultiCreateWindowDestroy,
                    scope: this
                }
            }
        });
        j.show();

    },
    /**
     * Reloads the store after the multi-create window was closed
     */
    onMultiCreateWindowDestroy: function () {
        this.store.load();
    },
    /**
     * Triggers a reload of the store when an edited record affects the store
     */
    syncChanges: function ()
    {
        this.down("partkeepr\\.StorageLocationGrid").getStore().load();
    },
    /**
     * Returns the selection model of the storage location grid
     * @return {Ext.selection.Model} The selection model
     */
    getSelectionModel: function ()
    {
        "use strict";
        return this.down("partkeepr\\.StorageLocationGrid").getSelectionModel();
    }


});
