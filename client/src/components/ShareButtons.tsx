import { useState } from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  PinterestShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  PinterestIcon,
  WhatsappIcon,
} from "react-share";
import { Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  hashtags?: string[];
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  className?: string;
}

export default function ShareButtons({
  url,
  title,
  description,
  imageUrl,
  hashtags = [],
  size = "md",
  showLabels = false,
  className = "",
}: ShareButtonsProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const iconSize = size === "sm" ? 44 : size === "md" ? 48 : 52;
  const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleNativeShare = async () => {
    if ('share' in navigator) {
      setIsSharing(true);
      try {
        await navigator.share({
          title,
          text: description || title,
          url: fullUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error("Share failed:", error);
        }
      } finally {
        setIsSharing(false);
      }
    }
  };

  const shareText = description || title;
  const hashtagString = hashtags.join(",");

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {showLabels && (
        <span className="text-sm font-medium text-muted-foreground mr-2">
          {t("share.title")}
        </span>
      )}

      {/* Native Share Button (Mobile - includes Instagram) */}
      {'share' in navigator && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNativeShare}
              disabled={isSharing}
              className="rounded-full"
              data-testid="button-share-native"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("share.native")}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Facebook */}
      <Tooltip>
        <TooltipTrigger asChild>
          <FacebookShareButton
            url={fullUrl}
            hashtag={hashtags[0] ? `#${hashtags[0]}` : undefined}
            data-testid="button-share-facebook"
          >
            <FacebookIcon size={iconSize} round />
          </FacebookShareButton>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("share.facebook")}</p>
        </TooltipContent>
      </Tooltip>

      {/* Twitter */}
      <Tooltip>
        <TooltipTrigger asChild>
          <TwitterShareButton
            url={fullUrl}
            title={title}
            hashtags={hashtags}
            data-testid="button-share-twitter"
          >
            <TwitterIcon size={iconSize} round />
          </TwitterShareButton>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("share.twitter")}</p>
        </TooltipContent>
      </Tooltip>

      {/* LinkedIn */}
      <Tooltip>
        <TooltipTrigger asChild>
          <LinkedinShareButton
            url={fullUrl}
            title={title}
            summary={description}
            data-testid="button-share-linkedin"
          >
            <LinkedinIcon size={iconSize} round />
          </LinkedinShareButton>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("share.linkedin")}</p>
        </TooltipContent>
      </Tooltip>

      {/* Pinterest */}
      {imageUrl && (
        <Tooltip>
          <TooltipTrigger asChild>
            <PinterestShareButton
              url={fullUrl}
              media={imageUrl}
              description={shareText}
              data-testid="button-share-pinterest"
            >
              <PinterestIcon size={iconSize} round />
            </PinterestShareButton>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("share.pinterest")}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* WhatsApp */}
      <Tooltip>
        <TooltipTrigger asChild>
          <WhatsappShareButton
            url={fullUrl}
            title={title}
            separator=" - "
            data-testid="button-share-whatsapp"
          >
            <WhatsappIcon size={iconSize} round />
          </WhatsappShareButton>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("share.whatsapp")}</p>
        </TooltipContent>
      </Tooltip>

      {/* Copy Link Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyLink}
            className="rounded-full"
            data-testid="button-copy-link"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? t("share.copied") : t("share.copyLink")}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
