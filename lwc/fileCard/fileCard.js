import { LightningElement, wire, track, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { updateRecord } from "lightning/uiRecordApi";
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import FORM_FACTOR from "@salesforce/client/formFactor";
import getRelatedFilesByRecordId from "@salesforce/apex/FilesListController.getRelatedFilesByRecordId";
import getTotalCount from "@salesforce/apex/FilesListController.getTotalCount";

export default class ContactDataTable extends NavigationMixin(
  LightningElement
) {
  @api recordId;
  @api community;
  @api uploadFiles;
  @api downloadFiles;
  @api label;
  @api icon;
  @api viewFile;
  @api cardHeight;
  @api minMobileColumns;
  @api communityComponentWidth;

  @api column1;
  @api column2;
  @api column3;
  @api column4;
  @api column5;
  @api column6;
  @api column7;
  @api column8;
  @api column9;
  @api column10;

  @track generateFieldsParameter = "";
  @track queryLimit = 1999;
  @track maxFileSize = 500;
  @track zeroFilesData;
  @track totalFilesCount;
  @track TOTAL_COUNT;
  @track loadingState = true;

  @track columns = [];
  @track displayColumns = false;
  @track draftValues = [];
  @track columnList = [];
  @track filteredColumnList = [];
  @track selectedRows = [];
  @track filterableSearchList = [];

  @track sortedBy;
  @track sortedByLabel;
  @track sortDirection = "asc";
  @track mobileSortDirection = "asc";

  @track filterSearchPlaceHolder;
  @track filterBy;
  @track filterState = false;
  @track searchTerm = "";
  @track queryTerm;

  @track areMultipleFilesSelected = true;
  @track isImageClicked = false;
  @track displayDownloadSize = false;
  displaySpinner = false;

  @track uploadFilesModal = false;
  @track downloadFilesModal = false;
  @track downloadType;

  @track clickedImageUrl;
  prefixUrl = `/sfc/servlet.shepherd/version/renditionDownload?rendition=thumb720by480&versionId=`;

  @track page = 1;
  @track startingRecord = 1;
  @track endingRecord = 0;
  @api pageSize = 10;
  @track totalRecordCount = 0;
  @track totalPage = 0;
  @track paginatedData = [];
  @track displayPreviousIcon = true;
  @track displayNextIcon = true;
  @track cardHeightStyle;
  @track fileSize;

  @track isSmallFlexiPageView;
  @api flexipageRegionWidth;

  files;
  filesData = [];
  filesError;

  objectInfo;
  objectInfoData = [];
  objectInfoError;

  @track actions = [
    { label: "View File Details", name: "view_file_details" },
    { label: "Preview File", name: "expand_image" }
  ];

  @wire(getRelatedFilesByRecordId, {
    recordId: "$recordId",
    fieldsParameter: "$generateFieldsParameter",
    queryLimit: "$queryLimit",
    searchTerm: "$searchTerm"
  })
  wiredFilesList(result) {
    this.files = result;
    if (result.data) {
      this.filesData = result.data;
      this.filesError = undefined;
      this.zeroFilesData = this.filesData.length === 0 ? false : true;
      this.totalFilesCount = this.filesData.length;
      this.loadingState = false;
      this.filterSearchPlaceHolder = `Filter by Title`;
      this.totalRecordCount = this.filesData.length;
      this.totalPage = Math.ceil(this.totalRecordCount / this.pageSize);
      this.paginatedData = this.filesData.slice(0, this.pageSize);
      this.endingRecord = this.pageSize;

      this.displayPaginatorHandler();
    } else if (result.error) {
      this.filesData = undefined;
      this.filesError = result.error;
    }
    if (this.filesData && this.objectInfoData.apiName === "ContentVersion") {
      this.createDataTableColumns();
    }
  }

  previousHandler() {
    if (this.page > 1) {
      this.page = this.page - 1;
      this.displayRecordPerPage(this.page);
    }
    this.displayPaginatorHandler();
  }

  nextHandler() {
    if (this.page < this.totalPage && this.page !== this.totalPage) {
      this.page = this.page + 1;
      this.displayRecordPerPage(this.page);
    }
    this.displayPaginatorHandler();
  }

  displayRecordPerPage(page) {
    this.startingRecord = (page - 1) * this.pageSize;
    this.endingRecord = this.pageSize * page;
    this.endingRecord =
      this.endingRecord > this.totalRecordCount
        ? this.totalRecordCount
        : this.endingRecord;
    this.paginatedData = this.filesData.slice(
      this.startingRecord,
      this.endingRecord
    );
    this.startingRecord = this.startingRecord + 1;
  }

  displayPaginatorHandler() {
    this.displayPreviousIcon = this.page === 1 ? false : true;
    this.displayNextIcon = this.page === this.totalPage ? false : true;
    this.onHandleSortPagination(this.sortedBy, this.mobileSortDirection);
  }

  handleMobileViewMore() {
    this.page = this.page + 1;
    this.handleMobileConcat(this.page);
  }

  handleMobileConcat(page) {
    this.startingRecord = (page - 1) * this.pageSize;
    this.endingRecord = this.pageSize * page;
    this.endingRecord =
      this.endingRecord > this.totalRecordCount
        ? this.totalRecordCount
        : this.endingRecord;
    const currentData = this.paginatedData;
    const nextSetOfData = this.filesData.slice(
      this.startingRecord,
      this.endingRecord
    );
    this.paginatedData = currentData.concat(nextSetOfData);
    this.startingRecord = this.startingRecord + 1;
    this.displayPaginatorHandler();
  }

  @wire(getObjectInfo, {
    objectApiName: "ContentVersion"
  })
  objectRecordData(result) {
    this.objectInfo = result;
    if (result.data) {
      this.objectInfoData = result.data;
      this.objectInfoError = undefined;
    } else if (result.error) {
      this.objectInfoData = undefined;
      this.objectInfoError = result.error;
    }
    if (this.filesData && this.objectInfoData.apiName === "ContentVersion") {
      this.createDataTableColumns();
    }
  }

  @wire(getTotalCount, { recordId: "$recordId" })
  totalWiredCount({ error, data }) {
    if (data) {
      this.TOTAL_COUNT = data;
    } else if (error) {
      console.log(error);
    }
  }

  connectedCallback() {
    if (this.community) {
      this.isDesktopView = true;

      if (FORM_FACTOR === "Small") {
        this.isSmallFlexiPageView = false;
      } else {
        this.flexipageRegionWidth = this.communityComponentWidth;
        this.isSmallFlexiPageView =
          this.flexipageRegionWidth === "SMALL" ? false : true;
      }

      if (!this.viewFile) {
        this.actions = [{ label: "Preview File", name: "expand_image" }];
      }
    } else {
      this.isSmallFlexiPageView =
        this.flexipageRegionWidth === "SMALL" ? false : true;
      this.isDesktopView = FORM_FACTOR === "Small" ? false : true;
    }

    this.columnList = [
      this.column1,
      this.column2,
      this.column3,
      this.column4,
      this.column5,
      this.column6,
      this.column7,
      this.column8,
      this.column9,
      this.column10
    ];

    this.filteredColumnList = this.columnList.filter(n => n !== "none");
    this.filteredColumnList = [...new Set(this.filteredColumnList)];
    this.generateFieldsParameter = this.filteredColumnList.join(", ");

    if (this.cardHeight) {
      this.cardHeightStyle = `height: ${this.cardHeight}px`;
    } else {
      this.cardHeightStyle = `height: 300px`;
    }

    if (!this.pageSize) {
      this.pageSize = 10;
    }

    if (!this.minMobileColumns) {
      this.minMobileColumns = 3;
    }
  }

  dataTableRefresh(){
    this.createDataTableColumns();
  }

  createDataTableColumns() {
    try {
      if (this.filesData && this.objectInfoData.apiName === "ContentVersion") {
        this.columns = this.filteredColumnList.reduce(
          (accumulator, fieldValue) => {
            let typeAttribute;
            let type;
            const columnData = this.objectInfoData.fields[fieldValue];

            if (columnData.filterable) {
              this.filterableSearchList.push(columnData.apiName);
            }
            if (columnData.dataType === "DateTime") {
              type = "date";
              typeAttribute = {
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              };
            } else if (
              columnData.dataType ===
              ("Double" || "Decimal" || "Integer" || "Long")
            ) {
              type = "number";
            } else if (columnData.dataType === "Email") {
              type = "email";
            } else if (columnData.dataType === "Phone") {
              type = "phone";
            } else if (columnData.dataType === "Percent") {
              type = "percent";
            } else if (columnData.dataType === "Currency") {
              type = "currency";
              typeAttribute = {
                currencyDisplayAs: "symbol"
              };
            } else if (columnData.dataType === "Url") {
              type = "url";
              typeAttribute = {
                taget: "_blank"
              };
            } else {
              type = columnData.dataType;
            }
            accumulator.push({
              label: columnData.label,
              fieldName: fieldValue,
              type: type,
              editable: columnData.updateable,
              sortable: true,
              typeAttributes: typeAttribute
            });
            return accumulator;
          },
          []
        );
        this.columns.push({
          type: "action",
          typeAttributes: { rowActions: this.actions }
        });
      }
      if(this.columns.length === 0){
        this.displayColumns = false;
      } else {
        this.displayColumns = true;
      }
    } catch (error) {
      console.log(error);
    }
  }

  handleSave(event) {
    const recordInputs = event.detail.draftValues.slice().map(draft => {
      const fields = Object.assign({}, draft);
      return { fields };
    });

    const promises = recordInputs.map(recordInput => updateRecord(recordInput));
    Promise.all(promises)
      .then(records => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: `${records.length} Records Updated`,
            variant: "success"
          })
        );
        // Clear all draft values
        this.draftValues = [];
        this.searchTerm = "";
        // Display fresh data in the datatable
        return refreshApex(this.files);
      })
      .catch(error => {
        // Handle error
        console.log(error);
      });
  }

  onHandleSort(event) {
    // field name
    this.sortedBy = event.detail.fieldName;
    this.sortedByLabel = this.objectInfoData.fields[
      event.detail.fieldName
    ].label;

    // sort direction
    this.sortDirection = event.detail.sortDirection;

    // calling sortdata function to sort the data based on direction and selected field
    this.sortData(event.detail.fieldName, event.detail.sortDirection);
  }

  onHandleSortPagination(field, direction) {
    this.sortedBy = field;
    this.sortedByLabel = field;

    // sort direction
    this.sortDirection = direction;

    // calling sortdata function to sort the data based on direction and selected field
    this.sortData(this.sortedBy, this.sortDirection);
  }

  sortData(fieldname, direction) {
    // serialize the data before calling sort function
    let parseData = JSON.parse(JSON.stringify(this.paginatedData));

    let keyValue = a => {
      return a[fieldname];
    };

    // checking reverse direction
    let isReverse = direction === "asc" ? 1 : -1;

    // sorting data
    parseData.sort(function(a, b) {
      a = keyValue(a) ? keyValue(a).toLowerCase() : ""; //To handle null values , uppercase records during sorting
      b = keyValue(b) ? keyValue(b).toLowerCase() : "";
      return isReverse * ((a > b) - (b > a));
    });

    // set the sorted data to data table data
    this.paginatedData = parseData;
  }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;
    switch (actionName) {
      case "view_file_details":
        this.showRowDetails(row);
        break;
      case "expand_image":
        this.expandImage(row);
        break;
      default:
    }
  }

  getSelectedRows(event) {
    this.selectedRows = event.detail.selectedRows;
    this.areMultipleFilesSelected =
      this.selectedRows.length === 0 ? true : false;

    this.calculateSelectedFileSizes(this.selectedRows);
  }

  calculateSelectedFileSizes(selectedRows) {
    if (selectedRows.length > 0) {
      this.fileSize = (
        selectedRows.reduce(function(a, b) {
          return a + b.ContentSize;
        }, 0) / 1000000
      ).toFixed(2);
    }
  }

  showRowDetails(row) {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: row.ContentDocumentId,
        actionName: "view"
      }
    });
  }

  expandImage(row) {
    if (this.community) {
      this.isImageClicked = true;
      this.clickedImageUrl = `${this.prefixUrl}${row.Id}`;
    } else {
      this[NavigationMixin.Navigate]({
        type: "standard__namedPage",
        attributes: {
          pageName: "filePreview"
        },
        state: {
          recordIds: row.ContentDocumentId
        }
      });
    }
  }

  handleFilterSearchSelected(event) {
    this.filterSearchPlaceHolder = `Filter by ${this.objectInfoData.fields[event.detail].label}`;
    this.filterBy = event.detail;
  }

  handleSearchTermChange(event) {
    const isEnterKey = event.keyCode === 13;
    if (isEnterKey) {
      if (event.target.value.length > 2) {
        this.searchTerm = event.target.value;
      } else {
        this.searchTerm = "";
        this.dispatchEvent(
          new ShowToastEvent({
            title: `Warning`,
            message: `Your search term must have 2 or more characters`,
            variant: "warning"
          })
        );
      }
    }
  }

  handleFoucsOutSearch(event) {
    if (event.target.value.length > 2) {
      this.searchTerm = event.target.value;
    } else {
      this.searchTerm = "";
      this.dispatchEvent(
        new ShowToastEvent({
          title: `Warning`,
          message: `Your search term must have 2 or more characters`,
          variant: "warning"
        })
      );
    }
  }

  handleFilterButtonClick() {
    this.filterState = !this.filterState;
  }

  handleUploadFiles() {
    this.uploadFilesModal = true;
  }

  handleDownloadFiles() {
    if (this.fileSize > this.maxFileSize || this.selectedRows.length > 101) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: `The Max File Size Download Limit`,
          message: `Please select the list of files under ${this.maxFileSize}MB or upload less than 100 files`,
          variant: "warning"
        })
      );
    } else {
      if (!this.areMultipleFilesSelected ) {
        this.downloadFilesModal = true;
        this.downloadType = "selected";
      }
    }
  }

  handleDownloadAllFiles() {
    this.calculateSelectedFileSizes(this.filesData);
    this.selectedRows = this.filesData;

    if (this.fileSize > this.maxFileSize || this.selectedRows.length > 101) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: `The Max File Size Download Limit`,
          message: `Please select the list of files under ${this.maxFileSize}MB or upload less than 100 files`,
          variant: "warning"
        })
      );
    } else {
      this.downloadFilesModal = true;
      this.downloadType = "all";
    }
  }

  handleFileModalClosed() {
    this.uploadFilesModal = false;
    return refreshApex(this.files);
  }

  handleDownloadFileModalClosed() {
    this.downloadFilesModal = false;
  }

  handleSelectedFiles() {
    if (!this.areMultipleFilesSelected) {
      const contentDocumentIdsList = this.selectedRows.map(contDocId => {
        return contDocId.ContentDocumentId;
      });
      const contList = contentDocumentIdsList.join(",");

      this[NavigationMixin.Navigate]({
        type: "standard__namedPage",
        attributes: {
          pageName: "filePreview"
        },
        state: {
          recordIds: `${contList}`
        }
      });
    }
  }

  handleMobileSortDirection() {
    this.mobileSortDirection =
      this.mobileSortDirection === "asc" ? "desc" : "asc";
    this.sortData(this.sortedBy, this.mobileSortDirection);
  }

  handleMobileSortSelected(event) {
    this.sortData(event.detail, this.mobileSortDirection);
    this.sortedBy = event.detail;
    this.sortedByLabel = this.objectInfoData.fields[event.detail].label;
  }

  handleModalClosed() {
    this.isImageClicked = false;
    refreshApex(this.files);
  }

  //MobileTabClicked Data
  mobileTabClicked() {
    this[NavigationMixin.Navigate]({
      type: "standard__component",
      attributes: {
        componentName: "c__mobilePanelList"
      },
      state: {
        c__recordId: this.recordId,
        c__label: this.label,
        c__icon: this.icon,
        c__filesData: this.filesData,
        c__columns: this.columns,
        c__minMobileColumns: this.minMobileColumns,
        c__filteredColumnList: this.filteredColumnList,
        c__totalFilesCount: this.totalFilesCount,
        c__zeroFilesData: this.zeroFilesData,
        c__uploadFiles: this.uploadFiles,
        c__displayNextIcon: this.displayNextIcon,
        c__page: this.page
      }
    });
  }
}