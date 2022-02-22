const micromatch = require("micromatch");

const { RULE_EXTERNAL } = require("../constants/settings");

const dependencyRule = require("../rules-factories/dependency-rule");

const { rulesOptionsSchema } = require("../helpers/validations");
const { dependencyLocation, elementRulesAllowDependency } = require("../helpers/rules");

function specifiersMatch(specifiers, options) {
  const importedSpecifiersNames = specifiers
    .filter((specifier) => {
      return specifier.type === "ImportSpecifier" && specifier.imported.name;
    })
    .map((specifier) => specifier.imported.name);
  return options.reduce((found, option) => {
    if (micromatch.some(importedSpecifiersNames, option)) {
      found.push(option);
    }
    return found;
  }, []);
}

function isMatchExternalDependency(dependency, matcher, options) {
  const isMatch = micromatch.isMatch(dependency.baseModule, matcher);
  if (isMatch && options) {
    const specifiersResult = specifiersMatch(dependency.specifiers, options.specifiers);
    return {
      result: specifiersResult.length > 0,
      report: specifiersResult,
    };
  }
  return {
    result: isMatch,
  };
}

function elementRulesAllowExternalDependency(element, dependency, options) {
  return elementRulesAllowDependency({
    element,
    dependency,
    options,
    isMatch: isMatchExternalDependency,
  });
}

function errorMessage(ruleData, file, dependency) {
  if (ruleData.report) {
    return `Usage of '${ruleData.report.join(", ")}' from external module '${
      dependency.baseModule
    }' is not allowed in '${file.type}'`;
  }
  return `Usage of external module '${dependency.baseModule}' is not allowed in '${file.type}'`;
}

module.exports = dependencyRule(
  {
    ruleName: RULE_EXTERNAL,
    description: `Check allowed external dependencies by element type`,
    schema: rulesOptionsSchema({
      targetMatcherOptions: {
        type: "object",
        properties: {
          specifiers: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    }),
  },
  function ({ dependency, file, node, context, options }) {
    if (dependency.isExternal) {
      const ruleData = elementRulesAllowExternalDependency(
        file,
        { ...dependency, specifiers: node.source.parent.specifiers },
        options
      );
      if (!ruleData.result) {
        context.report({
          message: errorMessage(ruleData, file, dependency),
          node: node,
          ...dependencyLocation(node, context),
        });
      }
    }
  },
  {
    validateRules: { onlyMainKey: true },
  }
);
