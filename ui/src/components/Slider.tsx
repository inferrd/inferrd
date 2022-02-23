import React from 'react'
import styled from 'styled-components'
import * as RadixSlider from '@radix-ui/react-slider';

const StyledSlider = styled(RadixSlider.Root)`
  position: relative;
  display: flex;
  align-items: center;
  user-select: none;
  touch-action: none;
  height: 16;
`;

const StyledTrack = styled(RadixSlider.Track)`
  background-color: gainsboro;
  width: 100%;
  position: relative;
  flexGrow: 1;
  height: 2;
`;

const StyledRange = styled(RadixSlider.Range)`
  position: absolute;
  background-color: dodgerblue;
  border-radius: 9999px;
  height: 100%;
`;

const StyledThumb = styled(RadixSlider.Thumb)`
  display: block;
  width: 16;
  height: 16;
  background-color: white;
  border: 1px solid lightgray;
  border-radius: 20px;

  &:focus: {
    outline: none;
    border-color: dodgerblue;
  }
`;

type Props = {
  value: number;
}

const Slider: React.FC<Props> = ({ value }) => {
  return (
    <StyledSlider defaultValue={[value]}>
      <StyledTrack>
        <StyledRange />
      </StyledTrack>
      <StyledThumb />
    </StyledSlider>
  )
}

export default Slider