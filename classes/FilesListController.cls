public with sharing class FilesListController {
   
    @AuraEnabled(cacheable=true)
    public static List<ContentVersion> getRelatedFilesByRecordId(String recordId, String fieldsParameter, Integer queryLimit, String searchTerm){
        searchTerm = searchTerm.trim();
        if (searchTerm == '') {
            //Get all the related files as expected
            getAllRelatedList(recordId, fieldsParameter, queryLimit);
        }
        searchTerm = '%'+ searchTerm +'%';
        //return query via searchTerm

        if(Schema.sObjectType.ContentDocumentLink.isAccessible()){
            List<ContentDocumentLink> files = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recordId WITH SECURITY_ENFORCED ];
            List<ID>fileIDs = new List<ID>();
            for (ContentDocumentLink fileLink : files){
                fileIDs.add(fileLink.ContentDocumentId);
            }
            if(Schema.sObjectType.ContentVersion.isAccessible()){
                String queryContentVersion = 'SELECT Id, ContentDocumentId, ContentSize,' + String.escapeSingleQuotes(fieldsParameter) + ' FROM ContentVersion'; 
                System.debug(queryContentVersion);
                List<ContentVersion> filesList = Database.query(String.escapeSingleQuotes(queryContentVersion) + ' WHERE ContentDocumentId IN :fileIds AND Title LIKE :searchTerm WITH SECURITY_ENFORCED ORDER BY LastModifiedDate DESC LIMIT :queryLimit');
                return filesList;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }

    @AuraEnabled(Cacheable=true)
    public static List<ContentVersion> getAllRelatedList(String recordId, String fieldsParameter, Integer queryLimit) {
        List<ContentDocumentLink> files = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recordId ];
        List<ID>fileIDs = new List<ID>();
        for (ContentDocumentLink fileLink : files){
            fileIDs.add(fileLink.ContentDocumentId);
        }
        String queryContentVersion = 'SELECT Id, ContentDocumentId, ' + String.escapeSingleQuotes(fieldsParameter) + ' FROM ContentVersion'; 
        System.debug(queryContentVersion);
        if(Schema.sObjectType.ContentVersion.isAccessible()){
            List<ContentVersion> filesList = Database.query(String.escapeSingleQuotes(queryContentVersion) + ' WHERE ContentDocumentId IN :fileIds WITH SECURITY_ENFORCED ORDER BY LastModifiedDate DESC LIMIT :queryLimit');
            return filesList;
        }
        else {
            return null;
        }
    }

    @AuraEnabled(cacheable=true)
    public static Integer getTotalCount(String recordId){
        if(Schema.sObjectType.ContentDocumentLink.isAccessible()){
            AggregateResult totalAggregateCount = [SELECT count(ContentDocumentId) total FROM ContentDocumentLink WHERE LinkedEntityId = :recordId WITH SECURITY_ENFORCED ];
            Integer count = (Integer)totalAggregateCount.get('total');
            return count;
        }
        else {
            return null;
        }
    }
}