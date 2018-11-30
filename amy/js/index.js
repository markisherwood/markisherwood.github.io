class PresentUnlocker {
  /**
   * Creates a new present unlocker.
   *
   * @param {number} requiredShares
   */
  constructor(requiredShares) {
    this.requiredShares = requiredShares;
    this.shares = [];
    this.cameras;
    const scannerOptions = {
      continuous: true,
      video: document.getElementById('js-camera-preview'),
      mirror: true,
      backgroundScan: false,
      refractoryPeriod: 5000,
      scanPeriod: 1,
    };
    this.scanner = new Instascan.Scanner(scannerOptions);
    this.scanner.addListener('scan', (content) => {
      this.addShare(content);
      PresentUnlocker.changeTab('progress');
    });
    Instascan.Camera.getCameras().then((cameras) => {
      this.cameras = cameras;
    });

    this.updateCurrentScansPlaceholders();
    this.updateScansRequiredPlaceholders();

    this.watchTabs();
  }

  watchTabs() {
    const tabLinks = document.querySelectorAll('a[data-toggle="tab"]');
    tabLinks.forEach((tab) => {
      tab.addEventListener('click', (event) => {
        const target = event.target.getAttribute('href');
        if (target === '#scan') {
          this.scanner.start(this.cameras[0]);
        } else {
          this.scanner.stop();
        }
      });
    });
  }

  static changeTab(tabName) {
    const tab = document.getElementById(`${tabName}-tab`);
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

const present = new PresentUnlocker(11);

$('.navbar-nav>li>a').on('click', () => {
  $('.navbar-collapse').collapse('hide');
});

$('.js-open-scan').on('click', () => {
  PresentUnlocker.changeTab('scan');
});
