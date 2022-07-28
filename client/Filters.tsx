import { CheckboxInput, Select } from "@canonical/react-components";
import { useFormik } from "formik";
import { useEffect } from "react";
import { specTypes } from "./App";

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
}: {
  authors: string[];
  teams: string[];
  onChange: (filterOptions: FilterOptions) => void;
}) => {
  const statuses = [
    "Approved",
    "Active",
    "Completed",
    "Pending Review",
    "Drafting",
    "Braindump",
    "Rejected",
    "Obsolete",
    "Unknown",
  ];
  const formik = useFormik({
    initialValues: {
      team: "all",
      status: [],
      type: [],
      author: "all",
      sortBy: "date",
    },
    onSubmit: onChange,
  });
  useEffect(() => {
    onChange(formik.values);
  }, [formik.values]);
  return (
    <form onSubmit={formik.handleSubmit}>
      <Select
        defaultValue="all"
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
        />
      ))}
      <Select
        defaultValue="all"
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
        defaultValue="all"
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
