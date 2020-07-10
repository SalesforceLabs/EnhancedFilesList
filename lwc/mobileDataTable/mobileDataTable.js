import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class MobileDataTable extends NavigationMixin(LightningElement) {
    @api filesData;
    @api columns;
    @api numberOfColumns;
    @api community;
    @api viewFile;

   @track minMobileColumns;
   displaySpinner = true;

    connectedCallback(){

        if(this.columns.length <= this.numberOfColumns && this.columns.length > 0){
            this.minMobileColumns = this.columns.slice(0, this.columns.length-1);
            this.displaySpinner = false;
        }
        else if(this.columns.length === 0){
            this.dispatchEvent(new CustomEvent("tablerefresh"));
            this.displaySpinner = true;
        }
        else {
            this.minMobileColumns = this.columns.slice(0, this.numberOfColumns);
            this.displaySpinner = false;
        }
        if(!this.community){
            this.viewFile = true;
        }
    }

    viewDetails(event){
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.currentTarget.dataset.id,
                actionName: 'view'
            },
        });
    }
}