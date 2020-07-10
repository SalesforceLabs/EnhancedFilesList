import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class UploadFilesModal extends LightningElement {

    @api recordId;

    closeModal(){
        this.dispatchEvent(new CustomEvent('selected'));
    }

    handleUploadFinished() {
        // Refresh via window.location
        this.dispatchEvent(
          new ShowToastEvent({
            title: `Success`,
            message: `File(s) have been uploaded`,
            variant: "success"
          })
        );
        this.dispatchEvent(new CustomEvent('selected'));
      }
}