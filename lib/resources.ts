export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileLabel?: string;
}

export const resources: ResourceItem[] = [
  {
    id: "1",
    title: "Programme Overview",
    description: "Introduction to the RoG Student Leadership Development Programme and its objectives.",
    fileUrl: "/resources/programme-overview.pdf",
    fileLabel: "PDF",
  },
  {
    id: "2",
    title: "Leadership Handbook",
    description: "Core leadership concepts and activities for participants.",
    fileUrl: "/resources/leadership-handbook.pdf",
    fileLabel: "PDF",
  },
  {
    id: "3",
    title: "Session Worksheets",
    description: "Printable worksheets for programme sessions.",
    fileUrl: "/resources/session-worksheets.pdf",
    fileLabel: "PDF",
  },
];
