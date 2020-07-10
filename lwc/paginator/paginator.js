import { LightningElement, api, track} from 'lwc';

export default class Paginator extends LightningElement {

    @api displayPrevious;
    @api displayNext;
    @api page;
    @api totalPage;

    @track singlePageDisplay;

    connectedCallback(){
        this.singlePageDisplay = (this.displayPrevious === false && this.displayNext === false) ? true : false;
    }

    previousHandler() {
        this.dispatchEvent(new CustomEvent('previous'));
    }

    nextHandler() {
        this.dispatchEvent(new CustomEvent('next'));
    }
}