import { FiTwitter } from 'react-icons/fi';

const TwitterShare = ({ message = '', url = '', hashtags = [] }) => {
  const defaultMessage = "I just entered the Monad Lottery! Join at";
  const shareMessage = message || defaultMessage;
  const shareUrl = url || "https://lottery.monadescrow.xyz";
  const hashtagsString = hashtags.length > 0 ? hashtags.join(',') : 'MonadLottery,Blockchain,Crypto';
  
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(hashtagsString)}`;
  
  return (
    <a
      href={twitterShareUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-outline bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border-[#1DA1F2] text-[#1DA1F2]"
    >
      <FiTwitter className="h-5 w-5" />
      <span>Share on Twitter</span>
    </a>
  );
};

export default TwitterShare;