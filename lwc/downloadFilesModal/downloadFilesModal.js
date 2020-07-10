import { LightningElement, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { CurrentPageReference } from "lightning/navigation";

export default class DownloadFilesModal extends NavigationMixin(
  LightningElement
) {
  @api recordId;
  @api fileSize;
  @api selectedFiles;
  @api downloadType;

  displayEmptyIllustration = true;
  downloadPrefixURL = `/sfc/servlet.shepherd/version/download/`;
  filesToDownload;
  filesCount;

  @wire(CurrentPageReference) pageRef;

  connectedCallback() {
    this.displayEmptyIllustration = this.selectedFiles.length > 0 ? false : true;
    this.filesCount = this.selectedFiles.length;
    this.selectedFilesAppend();
  }

  closeModal() {
    this.dispatchEvent(new CustomEvent("selected"));
  }

  selectedFilesAppend() {
    this.filesToDownload = this.selectedFiles.map(file => file.Id).join("/");
  }

  downloadFiles() {
    const origin = window.location.origin;
    /*
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: {
        url: `${origin}${this.downloadPrefixURL}${this.filesToDownload}`
      }
    });
   */
    
    window.open(`${origin}${this.downloadPrefixURL}${this.filesToDownload}`,'_target');
    window.history.replaceState( {} , '', '' );
    this.dispatchEvent(new CustomEvent("selected"));
     
  }
}