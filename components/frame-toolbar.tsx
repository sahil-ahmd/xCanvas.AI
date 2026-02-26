type PropsType = {
  title: string;
  isSelected?: boolean;
  disabled?: boolean;
  isDownloading: boolean;
  onOpenHtmlDialog: () => void;
  onDownloading?: () => void;
};

const FrameToolbar = ({
  title,
  isSelected,
  disabled,
  isDownloading,
  onOpenHtmlDialog,
  onDownloading,
}: PropsType) => {
  return <div>FrameToolbar</div>;
};

export default FrameToolbar;
