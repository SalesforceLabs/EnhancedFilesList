@isTest
private class ContentVersionFieldsPicklistTest {

   @isTest static void getVisualEditorPicklistValues() {
        ContentVersionFieldsPicklist cvfl = new ContentVersionFieldsPicklist();
        VisualEditor.DynamicPickListRows rows = cvfl.getValues();
       
        VisualEditor.DynamicPickListRows  myValues = new VisualEditor.DynamicPickListRows();
        VisualEditor.DataRow defaultValue = new VisualEditor.DataRow('NONE', 'none');
        myValues.addRow(defaultValue);
        Map<String, Schema.SObjectField> fieldMap = ContentVersion.sObjectType.getDescribe().fields.getMap();
        for (String fieldName: fieldMap.keySet()) {
            Schema.DescribeFieldResult fieldVal = fieldMap.get(fieldName).getDescribe();
            String fieldLabel = fieldVal.getLabel();
            String fieldApiName = fieldVal.getName();
            Boolean isUpdateable = fieldVal.isUpdateable();
            Boolean isAccessible = fieldVal.isAccessible();
            Boolean isNamePointing = fieldVal.isNamePointing();
            Boolean cotainsID = fieldLabel.contains('ID');
            Boolean containsSize = fieldApiName.equals('ContentSize');
            if(isAccessible && !cotainsID && !containsSize){
                VisualEditor.DataRow field = new VisualEditor.DataRow(fieldLabel, fieldApiName);
                myValues.addRow(field);
            }
        }

        System.assertEquals(myValues.size(), rows.size());
    } 

     @isTest static void getVisualEditorDefaultPicklistValues() {
        ContentVersionFieldsPicklist cvfl = new ContentVersionFieldsPicklist();
        VisualEditor.DataRow row = cvfl.getDefaultValue();
        VisualEditor.DataRow defaultValue = new VisualEditor.DataRow('NONE', 'none');

        System.assertEquals(defaultValue.getLabel(), row.getLabel());
     }



}