import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const CandidateForm = ({ formData }) => {
  const [initialValues, setInitialValues] = useState(() => {
    const storedValues = {};
    formData.fields.forEach((field) => {
      const storedValue =
        typeof window !== "undefined" && localStorage.getItem(field.field_id);
      storedValues[field.field_id] = storedValue || "";
    });
    return storedValues;
  });

  const [initialValuesSet, setInitialValuesSet] = useState(false);

  useEffect(() => {
    if (!initialValuesSet) {
      formData.fields.forEach((field) => {
        const storedValue = localStorage.getItem(field.field_id);
        setInitialValues((prevValues) => ({
          ...prevValues,
          [field.field_id]: storedValue || "",
        }));
      });
      setInitialValuesSet(true);
    }
  }, [formData.fields, initialValuesSet]);

  const validationSchema = Yup.object().shape(
    formData.fields.reduce((schema, field) => {
      if (field.validations) {
        field.validations.forEach((validation) => {
          switch (validation) {
            case "required":
              schema[field.field_id] = Yup.string().required(
                `${field.field_label} is required`
              );
              break;
            case "alphabets":
              schema[field.field_id] = Yup.string().matches(/^[A-Za-z\s]+$/, {
                message: `${field.field_label} should contain only alphabets`,
                excludeEmptyString: true,
              });
              break;
            case "email":
              schema[field.field_id] = Yup.string().email("Invalid email format");
              break;
            case "phone":
              schema[field.field_id] = Yup.string().matches(
                /^\+?([0-9]{2})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{5})$/,
                {
                  message: "Invalid phone number format",
                  excludeEmptyString: true,
                }
              );
              break;
            case "min_value_1970":
              schema[field.field_id] = Yup.number()
                .min(1970, "Year should be greater than or equal to 1970")
                .max(2010, "Year should be less than or equal to 2010")
                .nullable();
              break;
            case "max_value_2010":
              schema[field.field_id] = Yup.number()
                .min(1970, "Year should be greater than or equal to 1970")
                .max(2010, "Year should be less than or equal to 2010")
                .nullable();
              break;
            default:
              break;
          }
        });
      }
      return schema;
    }, {})
  );

  const handleChange = (event, setFieldValue) => {
    const { name, value } = event.target;
    setFieldValue(name, value);
    localStorage.setItem(name, value);
  };

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    console.log("Form submitted:", values);
    resetForm();
    localStorage.clear();
    setSubmitting(false);
  };

  const sections = {};
  formData.fields.forEach((field) => {
    if (!sections[field.section]) {
      sections[field.section] = [];
    }
    sections[field.section].push(field);
  });

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <div className="pb-10">
            <Form className="max-w-[600px] mx-auto mt-8">
              <h2 className="text-2xl text-center text-blue-400 font-semibold mb-4">
                {formData.form_header}
              </h2>
              {Object.keys(sections).map((sectionId) => (
                <div key={sectionId}>
                  <h3 className="p-2 text-lg font-semibold mb-2 border border-black">
                    {sections[sectionId][0].section_name}
                  </h3>
                  {sections[sectionId].map((field) => (
                    <div className="mb-4" key={field.field_id}>
                      <div className="relative flex items-center justify-between">
                        <label
                          htmlFor={field.field_id}
                          className="block font-semibold mb-1"
                        >
                          {field.field_label}
                        </label>
                        <div className="relative w-[350px]">
                          {field.field_type === "text" && (
                            <Field
                              type="text"
                              id={field.field_id}
                              name={field.field_id}
                              placeholder={field.info}
                              className="w-[90%] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                              required={field.validations[0] == "required"}
                              onChange={(event) => handleChange(event, setFieldValue)}
                            />
                          )}
                          {field.field_type === "radio" && (
                            <div className=" flex gap-x-2">
                              {field.field_options.map((option, index) => (
                                <div key={index} className="flex mb-2">
                                  <Field
                                    type="radio"
                                    id={`${field.field_id}_${option.value}`}
                                    name={field.field_id}
                                    value={option.value}
                                    className="mr-2"
                                    checked={values[field.field_id] == option.value}
                                    onChange={(event) =>
                                      handleChange(event, setFieldValue)
                                    }
                                  />
                                  <label htmlFor={`${field.field_id}_${option.value}`}>
                                    {option.Label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                          {field.field_type === "select" && (
                            <Field
                              as="select"
                              id={field.field_id}
                              name={field.field_id}
                              className="w-[90%] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                              onChange={(event) => handleChange(event, setFieldValue)}
                              value={values[field.field_id]}
                            >
                              <option value="">Select {field.field_label}</option>
                              {field.field_options.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.Label}
                                </option>
                              ))}
                            </Field>
                          )}
                        </div>
                        <span className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer group hover:visible hover:opacity-100">
                          <span className="flex items-center relative">
                            <span>ⓘ</span>
                            <span className="absolute left-[24px] p-3 tooltip invisible w-max max-w-[250px] bg-purple-600 text-white text-[12px] rounded-md opacity-0 duration-300 group-hover:visible group-hover:opacity-100 ">
                              {field.info}
                              <span className="absolute top-1/2 left-[-5px] transform -translate-y-1/2 w-3 h-3 bg-purple-600 rotate-45"></span>
                            </span>
                          </span>
                        </span>
                      </div>
                      <ErrorMessage
                        name={field.field_id}
                        component="div"
                        className="text-red-500 text-[12px]"
                      />
                    </div>
                  ))}
                </div>
              ))}
              <div className="max-w-[200px] mx-auto flex justify-between">
                <button className="bg-green-500 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:bg-blue-600">
                  {isSubmitting ? "Saving..." : "Save Draft"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:bg-blue-600"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </Form>
          </div>
        )}
      </Formik>
    </div>
  );
};

export default CandidateForm;
