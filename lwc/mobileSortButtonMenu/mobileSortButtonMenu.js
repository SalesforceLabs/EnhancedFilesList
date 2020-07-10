import { LightningElement, api, track } from 'lwc';

export default class MobileSortButtonMenu extends LightningElement {
    @api column;
    @api objectInfo;

    @track menu;

    connectedCallback(){
        this.menu = `Sort by ${this.objectInfo.fields[this.column].label}`;
    }

    handleMobileSort(event){
        this.dispatchEvent(new CustomEvent('selected', { detail: event.target.value }));
    }
}