Ext.define("PartKeepr.CategoryEditorTree", {
    alias: 'widget.CategoryEditorTree',
    extend: 'PartKeepr.CategoryTree',
    viewConfig: {
        plugins: {
            ptype: 'treeviewdragdrop',
            sortOnDrop: true
        }
    },
    hideHeaders: true,
    categoryModel: null,
    categoryService: null,
    columns: [
        {
            xtype: 'treecolumn',
            header: 'Name',
            dataIndex: 'name',
            flex: 1
        }
    ],
    initComponent: function ()
    {

        this.createToolbar();

        this.callParent();

        this.getView().on("drop", Ext.bind(this.onCategoryDrop, this));
        this.getView().on("beforedrop", Ext.bind(this.onBeforeDrop, this));
        this.getView().on("itemcontextmenu", Ext.bind(this.onItemContextMenu, this));

        this.createMenu();

    },
    onBeforeDrop: function (node, data, overModel, dropPosition, dropHandlers)
    {
        var draggedRecord = data.records[0];
        var droppedOn = this.getView().getRecord(node);

        if (!(draggedRecord instanceof PartKeepr.data.HydraTreeModel)) {
            // Workaround for EXTJS-13725 where dropping of non-tree-models cause issues
            dropHandlers.cancelDrop();
            this.fireEvent("foreignModelDrop", draggedRecord, droppedOn);
        }
    },
    onCategoryDrop: function (node, data, overModel, dropPosition)
    {
        var draggedRecord = data.records[0];

        if (!(draggedRecord instanceof PartKeepr.data.HydraTreeModel)) {
            return;
        } else {
            var targetRecord;

            if (dropPosition === "after" || dropPosition === "before") {
                targetRecord = overModel.parentNode;
            } else {
                targetRecord = overModel;
            }

            draggedRecord.callPutAction("move", {
                "parent": targetRecord.getId()
            });
        }
    },

    onItemContextMenu: function (view, record, item, index, event)
    {
        if (!(record instanceof PartKeepr.data.HydraTreeModel)) {
            return;
        }
        var menu = this.menu;
        event.stopEvent();

        menu.record = record;

        this.menuCategoryDelete.enable();

        if (record.parentNode !== null && record.parentNode.isRoot()) {
            this.menuCategoryDelete.disable();
        }

        if (record.hasChildNodes()) {
            this.menuCategoryDelete.disable();
        }

        menu.showAt(event.getXY());
    },
    createMenu: function ()
    {
        this.menuCategoryDelete = Ext.create("Ext.menu.Item", {
            text: i18n("Delete Category"),
            handler: Ext.bind(this.confirmCategoryDelete, this),
            iconCls: 'web-icon folder_delete'
        });

        this.menuCategoryAdd = Ext.create("Ext.menu.Item", {
            text: i18n("Add Category"),
            handler: Ext.bind(this.showCategoryAddDialog, this),
            iconCls: 'web-icon folder_add'
        });

        this.menuCategoryEdit = Ext.create("Ext.menu.Item", {
            text: i18n("Edit Category"),
            handler: Ext.bind(this.showCategoryEditDialog, this),
            iconCls: 'web-icon folder_edit'
        });

        this.menu = Ext.create('widget.menu', {
            items: [
                this.menuCategoryAdd,
                this.menuCategoryEdit,
                this.menuCategoryDelete
            ]
        });
    },
    createToolbar: function ()
    {
        this.toolbarExpandButton = Ext.create("Ext.button.Button", {
            iconCls: 'fugue-icon toggle-expand',
            tooltip: i18n("Expand All"),
            handler: this._onExpandClick,
            scope: this
        });

        this.toolbarCollapseButton = Ext.create("Ext.button.Button", {
            iconCls: 'fugue-icon toggle',
            tooltip: i18n("Collapse All"),
            handler: this._onCollapseClick,
            scope: this
        });

        this.toolbarReloadButton = Ext.create("Ext.button.Button", {
            iconCls: 'x-tbar-loading',
            tooltip: i18n("Reload"),
            handler: this._onReloadClick,
            scope: this
        });

        this.toolbar = Ext.create("Ext.toolbar.Toolbar", {
            enableOverflow: true,
            dock: 'top',
            items: [this.toolbarExpandButton, this.toolbarCollapseButton, this.toolbarReloadButton]
        });

        Ext.apply(this, {
            dockedItems: [this.toolbar]
        });
    },
    _onReloadClick: function ()
    {
        this.store.load();
    },
    _onExpandClick: function ()
    {
        this.getRootNode().firstChild.expand(true);
    },
    _onCollapseClick: function ()
    {
        this.getRootNode().firstChild.collapse(true);
    },
    confirmCategoryDelete: function ()
    {
        Ext.Msg.confirm(i18n("Confirm Category Delete"),
            sprintf(i18n("Do you really wish to delete the category %s?"), this.menu.record.get("name")),
            this.onCategoryDelete, this);
    },
    showCategoryAddDialog: function ()
    {
        var j = Ext.create("PartKeepr.CategoryEditorWindow", {
            record: Ext.create(this.categoryModel),
            categoryModel: this.categoryModel,
            parentRecord: this.menu.record,
            listeners: {
                save: Ext.bind(this.onUpdateRecord, this)
            }
        });

        j.show();
    },
    showCategoryEditDialog: function ()
    {
        var j = Ext.create("PartKeepr.CategoryEditorWindow", {
            record: this.menu.record,
            parentRecord: null,
            categoryModel: this.categoryModel,
            listeners: {
                save: Ext.bind(this.onUpdateRecord, this)
            }
        });

        j.show();
    },
    onUpdateRecord: function ()
    {
        this.store.load();
    },
    onCategoryDelete: function (btn)
    {
        if (btn == "yes") {
            this.menu.record.erase();
        }
    }
});
