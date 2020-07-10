import { LightningElement, api, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import { getObjectInfo } from "lightning/uiObjectInfoApi";

export default class MobilePanel extends NavigationMixin(LightningElement) {
  @api recordId;
  @api label;
  @api icon;
  @api filesData;
  @api columns;
  @api minMobileColumns;
  @api filteredColumnList;
  @api totalFilesCount;
  @api zeroFilesData;
  @api uploadFiles;
  @api displayNextIcon;
  @api page;

  @track mobileSortDirection = 'asc';
  @track sortedBy;
  @track filesModal = false;

  objectInfo;
  objectInfoData = [];
  objectInfoError;


  @track startingRecord = 1;
  @track endingRecord = 0;
  @track pageSize = 10;
  @track totalRecordCount = 0;
  @track totalPage = 0;
  @track paginatedData = [];
  @track totalFilesCount;

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
    if (this.filesData && this.objectInfoData) this.createDataTableColumns();
  }

  connectedCallback() {
    let col = [];
    let data = [];
    let filterData = [];
    this.columns = JSON.parse(JSON.stringify(this.columns));
    this.filesData = JSON.parse(JSON.stringify(this.filesData));

    // eslint-disable-next-line guard-for-in
    for (let i in this.columns) {
      col.push(this.columns[i]);
    }
    this.columns = col;

    // eslint-disable-next-line guard-for-in
    for (let i in this.filesData) {
      data.push(this.filesData[i]);
    }
    this.filesData = data;

    // eslint-disable-next-line guard-for-in
    for (let i in this.filteredColumnList) {
      filterData.push(this.filteredColumnList[i]);
    }
    this.filteredColumnList = filterData;

    this.totalRecordCount = this.filesData.length;
    this.totalPage = Math.ceil(this.totalRecordCount / this.pageSize);
    this.paginatedData = this.filesData.slice(0, this.pageSize);
    this.endingRecord = this.pageSize;
    this.displayPaginatorHandler();
  }

  displayPaginatorHandler(){
    this.displayNextIcon = this.page === this.totalPage ? false : true;
  }

  displayRecordPerPage(page){
    this.startingRecord = ((page - 1) * this.pageSize);
    this.endingRecord = (this.pageSize * page);
    this.endingRecord = (this.endingRecord > this.totalRecordCount) ? this.totalRecordCount : this.endingRecord;
    this.paginatedData = this.filesData.slice(this.startingRecord, this.endingRecord);
    this.startingRecord = this.startingRecord + 1;
  }

  handleMobileViewMore(){
    this.page = this.page + 1;
    this.handleMobileConcat(this.page);

    const value = this.page;
    const pageChangeEvent = new CustomEvent("pageselected", {
      detail: { value }
    });
    this.dispatchEvent(pageChangeEvent);
  }

  handleMobileConcat(page){
    this.startingRecord = ((page - 1) * this.pageSize);
    this.endingRecord = (this.pageSize * page);
    this.endingRecord = (this.endingRecord > this.totalRecordCount) ? this.totalRecordCount : this.endingRecord;
    const currentData = this.paginatedData;
    const nextSetOfData = this.filesData.slice(this.startingRecord, this.endingRecord);
    this.paginatedData = currentData.concat(nextSetOfData);
    this.startingRecord = this.startingRecord + 1;
    this.displayPaginatorHandler();
  }

  handleMobileSortSelected(event) {
    this.sortData(event.detail, this.mobileSortDirection);
    this.sortedBy = event.detail;
  }

  handleMobileSortDirection() {
    this.mobileSortDirection = this.mobileSortDirection === "asc" ? "desc" : "asc";
    this.sortData(this.sortedBy, this.mobileSortDirection);
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

  handleUploadFiles(){
    this.filesModal = true;
  }

  handleFileModalClosed() {
    this.filesModal = false;

    if(!this.zeroFilesData){
      this.uploadFiles = false;
    }
    //this.dispatchEvent(new CustomEvent('recordChange'));
  }

  handleUploadFinished(event) {
    this.dispatchEvent(
      new ShowToastEvent({
        title: `Success`,
        message: `File(s) have been uploaded`,
        variant: "success"
      })
    );
    this.dispatchEvent(new CustomEvent('selected'));
    this.dispatchEvent(new CustomEvent('recordChange'));
  }
}