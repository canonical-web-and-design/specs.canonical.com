import { Spec } from "./types";

const SpecCard = ({ spec }: { spec: Spec }) => {
  return (
    <div className="l-fluid-breakout__item" data-js="grid-item">
      <div
        className={`spec-card spec-card--${spec.status.toLowerCase()} p-card col-4 u-no-padding`}
      >
        <div className="spec-card__content p-card__inner">
          <div className="spec-card__header">
            <small className="spec-card__metadata-list">
              <ul className="p-inline-list--middot u-no-margin--bottom">
                <li className="p-inline-list__item">{spec.index}</li>
                <li className="p-inline-list__item">{spec.folderName}</li>
                <li className="p-inline-list__item">{spec.type}</li>
              </ul>
            </small>
            <div>
              {spec.status === "Approved" ||
              spec.status === "Completed" ||
              spec.status === "Active" ? (
                <div className="p-status-label--positive u-no-margin">
                  {spec.status}
                </div>
              ) : spec.status === "Pending Review" ? (
                <div className="p-status-label--caution u-no-margin">
                  Pending Review
                </div>
              ) : spec.status === "Drafting" || spec.status === "Braindump" ? (
                <div className="p-status-label u-no-margin">{spec.status}</div>
              ) : spec.status === "Rejected" || spec.status === "Obsolete" ? (
                <div className="p-status-label--negative u-no-margin">
                  {spec.status}
                </div>
              ) : (
                <div className="p-status-label--negative u-no-margin">
                  Unknown
                </div>
              )}
            </div>
          </div>
          <h3 className="p-heading--4 u-no-margin--bottom">
            <a href={spec.fileURL}>{spec.title}</a>
          </h3>
          <small>
            <em>{spec.authors.join(", ")}</em>
          </small>
          <p className="p-card__content">
            <i className="p-icon--comments">Comments</i>
            <small className="u-text--muted">
              {` ${spec.numberOfComments} comments ${
                spec.openComments > 0 ? `${spec.openComments} unresolved` : ""
              }`}
            </small>
          </p>
        </div>
        <div className="spec-card__footer p-card__inner">
          <em className="u-align--right">{`Last edit: ${spec.lastUpdated.toLocaleDateString(
            "en-GB",
            { day: "numeric", month: "short", year: "numeric" }
          )}`}</em>
        </div>
      </div>
    </div>
  );
};

export default SpecCard;
