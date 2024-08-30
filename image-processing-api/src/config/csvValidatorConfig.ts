import isURL from 'validator/lib/isURL';

export const csvValidatorConfig = {
    headers: [
      {
        name: 'S. No.',
        inputName: 'S. No.',
        required: true,
        unique: true,
        requiredError: function (
          headerName: any,
          rowNumber: any,
          columnNumber: any
        ) {
          return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
        },
        uniqueError: function (headerName: any, rowNumber: any) {
          return `${headerName} is not unique in the ${rowNumber} row`;
        },
      },
      {
        name: 'Product Name',
        inputName: 'Product Name',
        required: true,
        unique: true,
        requiredError: function (
          headerName: any,
          rowNumber: any,
          columnNumber: any
        ) {
          return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
        },
        uniqueError: function (headerName: any, rowNumber: any) {
          return `${headerName} is not unique in the ${rowNumber} row`;
        },
      },
      {
        name: 'Input Image Urls',
        inputName: 'Input Image Urls',
        validate: function (v: string) {
          const urls = v.split(',');

          return urls.every((url: string) => {
            if (isURL(url.trim())) {
              return true;
            } else {
              return false;
            }
          });
        },
        validateError: function (
          headerName: any,
          rowNumber: any,
          columnNumber: any
        ) {
          return `${headerName} is not valid in the row: ${rowNumber}, column:${columnNumber}`;
        },
      },
    ],
  };