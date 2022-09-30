import * as React from 'react';

export const helpPageScrollerId = "helpPageScroller";
export const helpSectionClass = "help-section";

export const anchorId = (id: string): string => `${id}-anchor`;

export const findIdOfCurrentSectionInView = (): string | undefined => {
  // eslint-disable-next-line unicorn/prefer-spread
  const allHelpSections = Array.from(document.querySelectorAll('.help-section'));
  return allHelpSections.find(a => a.getBoundingClientRect().bottom > 150)?.id;
};

// eslint-disable-next-line react/no-multi-comp
const AnchorLink = (props: { id: string, children: string, currentAnchor?: string }): JSX.Element => {
  const isCurrentAnchor: boolean = props.currentAnchor === props.id;

  const onClick = () => {
    const scroller = document.querySelector(`#${helpPageScrollerId}`)!;
    const target = document.querySelector(`#${anchorId(props.id)}`)!;
    const y = target.getBoundingClientRect().top + scroller.scrollTop;
    scroller.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <a
      className="underline"
      onClick={onClick}
      style={{ fontWeight: isCurrentAnchor ? 'bold' : 'normal' }}
    >
      {props.children}
    </a>
  );
};

export default AnchorLink;
