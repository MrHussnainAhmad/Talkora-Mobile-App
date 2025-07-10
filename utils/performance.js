class PerformanceMonitor {
  constructor() {
    this.measurements = new Map();
  }

  startMeasurement(key) {
    this.measurements.set(key, {
      startTime: Date.now(),
      endTime: null,
      duration: null
    });
  }

  endMeasurement(key) {
    const measurement = this.measurements.get(key);
    if (measurement) {
      measurement.endTime = Date.now();
      measurement.duration = measurement.endTime - measurement.startTime;
      
      if (__DEV__) {
        console.log(`⚡ Performance [${key}]: ${measurement.duration}ms`);
      }
      
      return measurement.duration;
    }
    return null;
  }

  getMeasurement(key) {
    return this.measurements.get(key);
  }

  clearMeasurements() {
    this.measurements.clear();
  }

  logAllMeasurements() {
    if (__DEV__) {
      console.log('📊 Performance Summary:');
      this.measurements.forEach((measurement, key) => {
        if (measurement.duration) {
          console.log(`  ${key}: ${measurement.duration}ms`);
        }
      });
    }
  }
}

export default new PerformanceMonitor();
