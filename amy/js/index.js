class presentUnlocker {
  /**
   * Creates a new present unlocker.
   *
   * @param {number} requiredShares
   */
  constructor(requiredShares) {
    this.requiredShares = requiredShares;
    this.shares = [];
    const scanner_options = {
      continuous: true,
      video: document.getElementById('js-camera-preview'),
      mirror: true,
      backgroundScan: false,
      refractoryPeriod: 5000,
      scanPeriod: 1,
    };
    this.scanner = new Instascan.Scanner(scanner_options);
    this.scanner.addListener('scan', (content) => {
      this.addShare(content);
      this.changeTab('progress');
    });
    Instascan.Camera.getCameras().then((cameras) => {
      if (cameras.length > 0) {
        this.scanner.start(cameras[0]);
      }
    });

    this.updateCurrentScansPlaceholders();
    this.updateScansRequiredPlaceholders();
  }

  changeTab(tabName) {
    var tab = document.getElementById(`${tabName}-tab`);
    tab.click();
  }

  addShare(share) {
    // Only add the share if it's not already in the list.
    if (!this.shares.includes(share)) {
      this.shares.push(share);
    }
    this.updateCurrentScansPlaceholders();
    this.updateProgressBar();
  }

  updateProgressBar() {
    const progressBarElement = document.querySelector('.progress-bar');
    const progress = this.countShares() / this.requiredShares * 100;
    progressBarElement.style.width = `${progress}%`;
    progressBarElement.setAttribute('aria-valuenow', this.countShares().toString());
    progressBarElement.setAttribute('aria-valuemax', this.requiredShares.toString());
  }

  updateScansRequiredPlaceholders() {
    const placeholders = document.querySelectorAll('.js-scans-required-scans');
    placeholders.forEach((node) => {
      node.innerText = this.requiredShares;
    });
  }

  updateCurrentScansPlaceholders() {
    const placeholders = document.querySelectorAll('.js-current-scans');
    placeholders.forEach((node) => {
      node.innerText = this.countShares();
    });
  }

  countShares() {
    return this.shares.length;
  }

  unlockPresent() {
    return secrets.combine(this.shares);
  }
}

let present = new presentUnlocker(10);
