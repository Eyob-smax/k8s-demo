/*eslint-disable*/
export function formatValidationErrors(errors: any) {
  if (!errors || !errors.issues) {
    return "validation failed";
  }

  if (Array.isArray(errors.issues)) {
    return errors.issues
      .map((issue: any) => {
        if (issue.path && issue.path.length > 0) {
          issue.path = issue.path.join(".");
        }
      })
      .join(", ");
  }

  return JSON.stringify(errors.issues);
}
