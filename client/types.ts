export type Spec = {
  folderName: string;
  fileName: string;
  fileID: string;
  fileURL: string;
  index: string;
  title: string;
  status: string;
  authors: [string];
  type: string;
  created: Date;
  lastUpdated: Date;
  numberOfComments: number;
  openComments: number;
};

export type Team = string;
