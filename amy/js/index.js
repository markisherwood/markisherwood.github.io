class PresentUnlocker {
  /**
   * Creates a new present unlocker.
   *
   * @param {number} requiredShares
   */
  constructor(requiredShares, presentId) {
    this.requiredShares = requiredShares;
    this.cameras = null;
    this.presentId = presentId;
    this.loadFromStorage();
    
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
    });
    Instascan.Camera.getCameras().then((cameras) => {
      this.cameras = cameras;
    });

    this.updateCurrentScansPlaceholders();
    this.updateScansRequiredPlaceholders();
    this.updateProgressBar();

    this.watchTabs();
  }

  saveToStorage() {
    localStorage.setItem(this.presentId, JSON.stringify(this.shares));
  }

  loadFromStorage() {
    const previousData = localStorage.getItem(this.presentId);
    this.shares = previousData !== null ? JSON.parse(previousData) : [];
  }

  clearStorage() {
    localStorage.removeItem(this.presentId);
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
    // Check lenght and character for validity.
    const verificationRegex = /^[a-f0-9]{35}$/;
    if (!verificationRegex.test(share)) {
      PresentUnlocker.createAlert("This doesn't look like a valid code.");
      return;
    }
    
    // Only add the share if it's not already in the list.
    if (this.shares.includes(share)) {
      PresentUnlocker.createAlert("You've already scanned this code.", 'info');
      return;
    }
    this.shares.push(share);
    this.updateCurrentScansPlaceholders();
    PresentUnlocker.changeTab('progress');
    this.updateProgressBar();
    this.saveToStorage();
  }
  

  updateProgressBar() {
    const progressBarElement = document.querySelector('.progress-bar');
    const progress = this.countShares() / this.requiredShares * 100;
    progressBarElement.style.width = `${progress}%`;
    progressBarElement.setAttribute('aria-valuenow', this.countShares().toString());
    progressBarElement.setAttribute('aria-valuemax', this.requiredShares.toString());

    // Check if all codes have been scanned.
    if (this.countShares() >= this.requiredShares) {
      progressBarElement.classList.add('finished');
      setTimeout(() => this.unlock, 4000);
    }
  }

  unlock() {
    const placeholders = document.querySelectorAll('.js-answer');
    const answer = this.decrypt();
    placeholders.forEach((node) => {
      node.innerText = answer;
    });
    const unlockTab = document.getElementById('unlock-tab');
    unlockTab.setAttribute('aria-disabled', 'false');
    unlockTab.classList.remove('disabled');
    const scanButton = document.querySelector('.js-open-scan');
    scanButton.setAttribute('aria-disabled', 'true');
    scanButton.classList.add('disabled');
    const fireworks = document.getElementById('fireworks-canvas');
    document.getElementById('unlock').append(fireworks);
    PresentUnlocker.changeTab('unlock');
  }

  decrypt() {
    return secrets.combine(this.shares);

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

  static createAlert(message, type='warning') {
    const alert = document.createElement('div');
    const classes = [
      'alert',
      `alert-${type}`,
      'alert-dismissible',
      'fade',
      'show',
    ];
    alert.classList.add(...classes);
    alert.setAttribute('role', 'alert');
    alert.innerText = message;
    const closeButton = document.createElement('button');
    closeButton.setAttribute('type', 'button');
    closeButton.classList.add('close');
    closeButton.setAttribute('data-dismiss', 'alert');
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.innerHTML = '<span aria-hidden="true">&times;</span>';
    alert.append(closeButton);
    const alertContainer = document.querySelector('.alert-container');
    alertContainer.append(alert);
  }
}

const present = new PresentUnlocker(11, '2018');

$('.navbar-nav>li>a').on('click', () => {
  $('.navbar-collapse').collapse('hide');
});

$('.js-open-scan').on('click', () => {
  PresentUnlocker.changeTab('scan');
});
