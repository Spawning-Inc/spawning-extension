import React from 'react';

type StatusMessageProps = {
  status: string;
};

const StatusMessage: React.FC<StatusMessageProps> = ({ status }) => {
  return (
    <div id="status_message">
      {status}
    </div>
  );
};

export default StatusMessage;
