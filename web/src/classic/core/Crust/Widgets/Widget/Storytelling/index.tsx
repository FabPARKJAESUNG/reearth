import { useRef } from "react";
import { useClickAway, useMedia } from "react-use";

import Flex from "@reearth/classic/components/atoms/Flex";
import Icon from "@reearth/classic/components/atoms/Icon";
import Text from "@reearth/classic/components/atoms/Text";
import { styled, css, metricsSizes } from "@reearth/services/theme";

import type { ComponentProps as WidgetProps } from "..";
import type { Camera, Theme } from "../types";

import useHooks, { Story as StoryType } from "./hooks";

export type { Story } from "./hooks";
export type Props = WidgetProps<Property>;

export type Property = {
  default?: {
    duration?: number;
    range?: number;
    camera?: Camera;
    autoStart?: boolean;
  };
  stories?: StoryType[];
};

const Storytelling = ({
  widget,
  theme,
  context: { selectedLayerId, onFlyTo, onLayerSelect, onLookAt, findPhotooverlayLayer } = {},
}: Props): JSX.Element | null => {
  const storiesData = widget?.property?.stories;
  const { camera, duration, autoStart, range } = widget?.property?.default ?? {};
  const isExtraSmallWindow = useMedia("(max-width: 420px)");

  const { stories, menuOpen, selected, handleNext, handlePrev, selectAt, openMenu, toggleMenu } =
    useHooks({
      camera,
      autoStart,
      range,
      duration,
      stories: storiesData,
      selectedLayerId,
      onFlyTo: onFlyTo,
      onLayerSelect,
      onLookAt,
      findPhotooverlayLayer,
    });

  const wrapperRef = useRef<HTMLDivElement>(null);
  useClickAway(wrapperRef, () => {
    openMenu(false);
  });

  return (
    <>
      <Menu
        publishedTheme={theme}
        ref={wrapperRef}
        menuOpen={menuOpen}
        extended={!!widget?.extended?.horizontally}
        area={widget?.layout?.location?.area}
        align={widget?.layout?.align}>
        {stories.map((story, i) => (
          <MenuItem
            publishedTheme={theme}
            key={story.layer}
            selected={selected?.story.layer === story.layer}
            align="center"
            onClick={selectAt.bind(undefined, i)}>
            <StyledIcon
              iconColor={theme?.mainIcon}
              icon="marker"
              size={16}
              color={selected?.story.layer === story.layer ? theme?.strongText : theme?.mainText}
            />
            <Text
              size="m"
              color={selected?.story.layer === story.layer ? theme?.strongText : theme?.mainText}
              otherProperties={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}>
              {story.title}
            </Text>
          </MenuItem>
        ))}
      </Menu>
      <Widget
        publishedTheme={theme}
        extended={!!widget.extended?.horizontally}
        floating={!widget.layout}>
        <ArrowButton publishedTheme={theme} disabled={!selected?.index} onClick={handlePrev}>
          <Icon icon="arrowLeft" size={24} />
        </ArrowButton>
        <Current align="center" justify="space-between">
          <MenuIcon
            publishedTheme={theme}
            icon="storytellingMenu"
            onClick={toggleMenu}
            menuOpen={menuOpen}
          />
          <Title color={theme?.mainText} size="m" weight="bold">
            {selected?.story.title}
          </Title>
          <Text
            color={theme?.weakText}
            size={isExtraSmallWindow ? "xs" : "m"}
            weight="bold"
            otherProperties={{ userSelect: "none" }}>
            {typeof selected === "undefined" ? "-" : selected.index + 1} /{" "}
            {stories.length > 0 ? stories.length : "-"}
          </Text>
        </Current>
        <ArrowButton
          publishedTheme={theme}
          disabled={selected?.index === stories.length - 1}
          onClick={handleNext}>
          <Icon icon="arrowRight" size={24} />
        </ArrowButton>
      </Widget>
    </>
  );
};

const Widget = styled.div<{
  publishedTheme?: Theme;
  extended?: boolean;
  floating?: boolean;
}>`
  background-color: ${({ publishedTheme }) => publishedTheme?.background};
  color: ${({ publishedTheme }) => publishedTheme?.mainText};
  display: flex;
  align-items: stretch;
  border-radius: ${metricsSizes["s"]}px;
  overflow: hidden;
  height: 80px;
  width: ${({ extended }) => (extended ? "100%" : "500px")};
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);

  ${({ floating }) =>
    floating
      ? css`
          position: absolute;
          bottom: 80px;
          left: 80px;
        `
      : null}

  @media (max-width: 560px) {
    display: flex;
    width: ${({ extended }) => (extended ? "100%" : "90vw")};
    margin: 0 auto;
    height: 56px;
  }
`;

const ArrowButton = styled.button<{ publishedTheme?: Theme }>`
  background-color: ${({ publishedTheme }) => publishedTheme?.mask};
  display: flex;
  flex-flow: column;
  justify-content: center;
  text-align: center;
  border: none;
  padding: ${metricsSizes["s"]}px;
  cursor: pointer;
  color: ${({ publishedTheme }) => publishedTheme?.mainIcon};

  &:disabled {
    color: ${({ publishedTheme }) => publishedTheme?.weakIcon};
    cursor: auto;
  }
  @media (max-width: 420px) {
    padding: ${metricsSizes["2xs"]}px;
  }
`;

const Current = styled(Flex)`
  width: 100%;
  padding: ${metricsSizes["2xl"]}px;
  @media (max-width: 420px) {
    padding: ${metricsSizes["s"]}px;
  }
`;

const Title = styled(Text)<{ color?: string }>`
  color: ${({ color }) => color};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  box-sizing: border-box;
  margin: 0 auto;
  max-width: 250px;
  text-align: center;
  @media (max-width: 420px) {
    max-width: 190px;
  }
`;

const StyledIcon = styled(Icon)<{ iconColor?: string }>`
  color: ${({ color }) => color};
  margin-right: ${metricsSizes["l"]}px;
  flex-shrink: 0;
`;

const MenuIcon = styled(Icon)<{ menuOpen?: boolean; publishedTheme?: Theme }>`
  background: ${props =>
    props.menuOpen && props.publishedTheme ? props.publishedTheme.select : "unset"};
  border-radius: 25px;
  padding: ${metricsSizes["xs"]}px;
  margin-right: ${metricsSizes["xs"]}px;
  cursor: pointer;
  user-select: none;
  color: ${({ publishedTheme: theme }) => theme?.mainIcon};
`;

const Menu = styled.div<{
  menuOpen?: boolean;
  publishedTheme?: Theme;
  extended?: boolean;
  area?: string;
  align?: string;
}>`
  background-color: ${({ publishedTheme: theme }) => theme?.background};
  z-index: ${props => props.theme.zIndexes.dropDown};
  position: absolute;
  ${({ area, align }) =>
    area === "top" || (area === "middle" && align === "start") ? "top: 90px" : "bottom: 90px"};
  width: 324px;
  max-height: ${({ area, align }) =>
    area === "middle" && align === "centered" ? "200px" : "500px"};
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: ${metricsSizes["s"]}px;
  display: ${({ menuOpen }) => (!menuOpen ? "none" : "")};
  padding: ${metricsSizes["m"]}px ${metricsSizes["s"]}px;
  @media (max-width: 560px) {
    width: ${({ extended }) => (extended ? `calc(100% - 18px)` : "65vw")};
    max-height: ${({ area, align }) =>
      area === "middle" && align === "centered" ? "30vh" : "70vh"};
    border: 1px solid ${props => props.theme.main.text};
    top: ${({ area, align }) =>
      area === "top" || (area === "middle" && align === "start") ? "60px" : null};
    bottom: ${({ area, align }) =>
      (area === "middle" && align !== "start") || area !== "top" ? "60px" : null};
  }
`;

const MenuItem = styled(Flex)<{ selected?: boolean; publishedTheme?: Theme }>`
  border-radius: ${metricsSizes["m"]}px;
  padding: ${metricsSizes["m"]}px ${metricsSizes["s"]}px;
  background: ${({ publishedTheme: theme, selected }) =>
    selected && theme ? theme.select : "inherit"};
  cursor: pointer;
  user-select: none;
  &:hover {
    background: ${props => !props.selected && props.publishedTheme?.mask};
  }
`;

export default Storytelling;
