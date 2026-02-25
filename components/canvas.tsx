interface CanvasProps {
  projectId: string;
  projectName: string | null;
  isPending: boolean;
}

const Canvas = ({ projectId, projectName, isPending }: CanvasProps) => {
  return <div>Canvas</div>;
};

export default Canvas;
