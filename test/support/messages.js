function errorMessage(errors, index, defaultMessage) {
  return errors[index] || defaultMessage;
}

function customErrorMessage(errors, index, defaultMessage) {
  return errorMessage(errors, index, defaultMessage);
}

function elementTypesNoRuleMessage({ file, dep }) {
  return `No rule allowing this dependency was found. File is of type ${file}. Dependency is of type ${dep}`;
}

function entryPointNoRuleMessage({ entryPoint, dep }) {
  return `No rule allows the entry point '${entryPoint}' in dependencies of type ${dep}`;
}

module.exports = {
  customErrorMessage,
  elementTypesNoRuleMessage,
  entryPointNoRuleMessage,
};
