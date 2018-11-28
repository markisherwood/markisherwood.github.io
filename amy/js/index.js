class presentUnlocker {
  /**
   * Creates a new present unlocker.
   * 
   * @param {int} requiredShares 
   */
  constructor(requiredShares) {
    this.requiredShares = requiredShares;
    this.shares = [];
    let scanner_options = {
      continuous: true,
      video: document.getElementById('js-camera-preview'),
      mirror: true,
      backgroundScan: false,
      refractoryPeriod: 5000,
      scanPeriod: 1
    };
    this.scanner = new Instascan.Scanner(scanner_options);
    this.scanner.addListener('scan', content => {
      console.log(content);
    });
    Instascan.Camera.getCameras().then(cameras => {
      if (cameras.length > 0) {
        this.scanner.start(cameras[0]);
      } else {
        console.error('No cameras found.');
      }
    }).catch(function (e) {
      console.error(e);
    });
  }

  addShare(share) {
    // Only add the share if it's not already in the list.
    if (!this.shares.includes(share)) {
      this.shares.push(share);
    }
  }

  countShares() {
    return this.shares.length;
  }

  unlockPresent() {
    return secrets.combine(this.shares);
  }
}

let present = new presentUnlocker(10);