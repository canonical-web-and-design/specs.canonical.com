import { CheckboxInput, Select } from "@canonical/react-components";
import { useFormik } from "formik";
import { useEffect } from "react";
import { specStatuses, specTypes } from "./App";
import { capitalize } from "./utils";

export type FilterOptions = {
  team: string;
  status: string[];
  type: string[];
  author: string;
  sortBy: string;
};

const Filters = ({
  authors,
  teams,
  onChange,
  defaultOptions,
}: {
  authors: string[];
  teams: string[];
  onChange: (filterOptions: FilterOptions) => void;
  defaultOptions: FilterOptions;
}) => {
  const statuses = [...specStatuses].map((status) => capitalize(status));
  const formik = useFormik({
    initialValues: defaultOptions,
    onSubmit: onChange,
  });
  useEffect(() => {
    onChange(formik.values);
  }, [formik.values]);
  return (
    <form onSubmit={formik.handleSubmit}>
      <Select
        defaultValue={defaultOptions.team}
        label="Team"
        name="team"
        id="team"
        options={[
          { value: "all", label: "All teams" },
          ...teams.map((team) => ({ label: team, value: team })),
        ]}
        onChange={formik.handleChange}
      />
      <p className="u-no-margin--bottom">Status</p>
      {statuses.map((status) => (
        <CheckboxInput
          key={status}
          label={status}
          name="status"
          value={status}
          onChange={formik.handleChange}
          defaultChecked={
            !!defaultOptions.status.find(
              (defaultCheckedStatus) => defaultCheckedStatus === status
            )
          }
        />
      ))}

      <p className="u-no-margin--bottom">Type</p>
      {[...specTypes].map((typeName) => (
        <CheckboxInput
          key={typeName}
          label={typeName}
          value={typeName}
          name="type"
          onChange={formik.handleChange}
          defaultChecked={
            !!defaultOptions.type.find(
              (defaultCheckedType) => defaultCheckedType === typeName
            )
          }
        />
      ))}
      <Select
        defaultValue={defaultOptions.author}
        label="Author"
        name="author"
        id="author"
        options={[
          { value: "all", label: "All authors" },
          ...authors.map((author) => ({ label: author, value: author })),
        ]}
        onChange={formik.handleChange}
      />
      <Select
        defaultValue={defaultOptions.sortBy}
        label="Sort by"
        name="sortBy"
        id="sortBy"
        options={[
          { value: "date", label: "Last modified" },
          { value: "name", label: "Name" },
          { value: "index", label: "Spec index" },
        ]}
        onChange={formik.handleChange}
      />
    </form>
  );
};

export default Filters;
