({
    doInit : function(component, event, helper) {
        var myPageRef = component.get("v.pageReference");

        var recordId = myPageRef.state.c__recordId;
        component.set("v.recordId", recordId);

        var label = myPageRef.state.c__label;
        component.set("v.label", label);

        var icon = myPageRef.state.c__icon;
        component.set("v.icon", icon);

        var columns = myPageRef.state.c__columns;
        component.set("v.columns", columns);

        var filesData = myPageRef.state.c__filesData;
        component.set("v.filesData", filesData);

        var minMobileColumns = myPageRef.state.c__minMobileColumns;
        component.set("v.minMobileColumns", minMobileColumns);

        var filteredColumnList = myPageRef.state.c__filteredColumnList;
        component.set("v.filteredColumnList", filteredColumnList);

        var totalFilesCount = myPageRef.state.c__totalFilesCount;
        component.set("v.totalFilesCount", totalFilesCount);

        var zeroFilesData = myPageRef.state.c__zeroFilesData;
        component.set("v.zeroFilesData", zeroFilesData);

        var uploadFiles = myPageRef.state.c__uploadFiles;
        component.set("v.uploadFiles", uploadFiles);

        var displayNextIcon = myPageRef.state.c__displayNextIcon;
        component.set("v.displayNextIcon", displayNextIcon);

        var page = myPageRef.state.c__page;
        component.set("v.page", page);
    },
    reInit : function(component, event, helper) {
        $A.get('e.force:refreshView').fire();
    },
})