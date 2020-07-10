@isTest
private class FilesListControllerTest {

    @isTest static void searchRelatedFiles() {

        Account acct = new Account(Name='Test Account');
        insert acct;

        String fieldsParameter = 'Title, Description';
        Integer queryLimit = 10;
        String searchTerm = '';

        ContentVersion cv = new ContentVersion(
            Title = 'Test',
            PathOnClient = 'Test.jpg',
            VersionData = Blob.valueOf('Test Content Data'),
            IsMajorVersion = true
        );
        insert cv;

        List<ContentDocument> documents = [SELECT Id, Title, LatestPublishedVersionId FROM ContentDocument];
        ContentDocumentLink cdl = New ContentDocumentLink();
        cdl.LinkedEntityId = acct.id;
        cdl.ContentDocumentId = documents[0].Id;
        cdl.shareType = 'V';
        insert cdl;

        List<ContentVersion> filesList = FilesListController.getRelatedFilesByRecordId(acct.Id, fieldsParameter, queryLimit, searchTerm);
        System.assertEquals('Test', filesList[0].Title);

    }

    @isTest static void countList() {

        Account acct = new Account(Name='Test Account');
        insert acct;

        ContentVersion cv = new ContentVersion(
            Title = 'Test',
            PathOnClient = 'Test.jpg',
            VersionData = Blob.valueOf('Test Content Data'),
            IsMajorVersion = true
        );
        insert cv;

        List<ContentDocument> documents = [SELECT Id, Title, LatestPublishedVersionId FROM ContentDocument];
        ContentDocumentLink cdl = New ContentDocumentLink();
        cdl.LinkedEntityId = acct.id;
        cdl.ContentDocumentId = documents[0].Id;
        cdl.shareType = 'V';
        insert cdl;

        Integer count = FilesListController.getTotalCount(acct.Id);
        System.assertEquals(1, count);
    }
}