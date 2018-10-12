export const formatBytesGB = (input: number = 0) => {
  const factor: number = 1024; // Numbers are assumed to be in MBs.
  const units: string = "GB";

  return (Math.round(input / factor * 100) / 100).toString() + units; // (input / bytesInAGb).toFixed(2)
};

export const formatBytes = (input: number = 0, referenceValue: number) => {
  const bytesInMB: number = 1048576;
  const bytesInGB: number = 1073741824;
  let factor: number;

  let units: string;

  // referenceValue is used for consistency of units
  if (referenceValue !== undefined || referenceValue !== null) {
    if (referenceValue > 1073741824) {
      factor = bytesInGB;
      units = " GB";
    } else {
      factor = bytesInMB;
      units = " MB";
    }
  } else {
    if (input > 1073741824) {
      factor = bytesInGB;
      units = " GB";
    } else {
      factor = bytesInMB;
      units = " MB";
    }
  }

  return (Math.round(input / factor * 100) / 100).toString() + units; // (input / bytesInAGb).toFixed(2)
};