import { JiraLabel } from "src/types/JiraLabel";

  export const encodeAndQuoteLabel = (label: string): string => {

    // KNOWN-16: Need to fix the encoding of labels to be compatible with the JQL query.

    let encodedLabel = label;
    encodedLabel = encodeURIComponent(encodedLabel);

    // It seems JQL allows both quoted and unquoted labels, but it is assumed that quoting them would lead to increased robustness.
    return `"${encodedLabel}"`;
  }

  export const filterProblematicLabels = (labels: JiraLabel[]): JiraLabel[] => {
    // KNOWN-16: Remove problementatic labels as a workaround for a problem with labels that contain special characters, but which
    //           cause issues when used in JQL queries.
    const filteredLabels: JiraLabel[] = labels.filter(label => {
      let includeLabel = label.value.indexOf('"') === -1;
      includeLabel = includeLabel && label.value.indexOf('\n') === -1; // Exclude labels with newlines
      includeLabel = includeLabel && label.value.indexOf('\r') === -1; // Exclude labels with carriage returns
      includeLabel = includeLabel && label.value.indexOf('\\') === -1; // Exclude labels with backslashes
      includeLabel = includeLabel && label.value.indexOf(' ') === -1; // Exclude labels with spaces
      includeLabel = includeLabel && label.value.indexOf('&') === -1; // Exclude labels with ampersands
      includeLabel = includeLabel && label.value.indexOf('%') === -1; // Exclude labels with percent signs
      includeLabel = includeLabel && label.value.indexOf('/') === -1; // Exclude labels with slashes
      // console.log(`filterProblematicLabels: Label "${label}" is ${includeLabel ? 'included' : 'excluded'}.`);
      return includeLabel;
    });
    return filteredLabels;
  }
