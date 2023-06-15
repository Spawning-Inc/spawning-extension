import React, { useEffect, useState } from 'react';
import { BsImages, BsFileMusic, BsFillCameraVideoFill, BsFillFileEarmarkTextFill, BsCodeSquare, BsCloud, BsHash, BsFillFileEarmarkBarGraphFill } from 'react-icons/bs';

type RecordProps = {
  record: {
    id?: string,
    url?: string,
    timestamp?: string,
    domains: number,
    images: number,
    audio: number,
    video: number,
    text: number,
    code: number,
    other: number,
  },
};

const Record: React.FC<RecordProps> = ({ record }) => {
  const [faviconUrl, setFaviconUrl] = useState('');

  const formatUrl = (url: string | undefined) => {
    if (!url) return '';

    let formattedUrl = url.replace(/(https?:\/\/)?(www\.)?/, '');

    if (formattedUrl.length > 25) {
      formattedUrl = formattedUrl.slice(0, 25) + '...';
    }

    return formattedUrl;
    };

    const formattedTimestamp = () => {
        if (!record.timestamp) return '';
    
        const timestampDate = new Date(record.timestamp);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
    
        if (timestampDate.toDateString() === today.toDateString()) {
          return 'Today';
        } else if (timestampDate.toDateString() === yesterday.toDateString()) {
          return 'Yesterday';
        } else {
          return timestampDate.toLocaleDateString();
        }
      };

  const fetchFaviconUrl = () => {
    if (!record.url) return;

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${record.url}`;
    setFaviconUrl(faviconUrl);
  };

  useEffect(() => {
    fetchFaviconUrl();
  }, []);

  return (
    <div className='record-card'>
      {record.url ? (
        <>
          {faviconUrl && <img src={faviconUrl} alt="Favicon" />}
          <a href={record.url} target="_blank" rel="noopener noreferrer">{formatUrl(record.url)}</a>
        </>
      ) : (
        <br />
      )}
      {record.timestamp ? <div>{formattedTimestamp()}</div> : <br />}
      {record.domains !== 0 && <div><BsCloud /> Domains: {record.domains}</div>}
        {record.images !== 0 && <div><BsImages /> Images: {record.images}</div>}
        {record.audio !== 0 && <div><BsFileMusic /> Audio: {record.audio}</div>}
        {record.video !== 0 && <div><BsFillCameraVideoFill /> Video: {record.video}</div>}
        {record.text !== 0 && <div><BsFillFileEarmarkTextFill /> Text: {record.text}</div>}
        {record.code !== 0 && <div><BsCodeSquare /> Code: {record.code}</div>}
        {record.other !== 0 && <div><BsHash /> Other: {record.other}</div>}
      {record.id ? (
        <a className = 'report-link'href={`https://haveibeentrained.com?materialize_id=${record.id}`} target='_blank'>
          <BsFillFileEarmarkBarGraphFill />
        </a>
      ) : (
        <br />
      )}
    </div>
  );
};

export default Record;
