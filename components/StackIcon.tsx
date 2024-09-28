import React from 'react';
import { IconType } from 'react-icons';

interface IStackIcon {
  IconComponent: IconType;
  name: string;
  style: string;
}

const StackIcon = ({ IconComponent, name, style }: IStackIcon) => (
  <div className="flex flex-col items-center relative group">
    <IconComponent className={`${style}`} />
    <span className="absolute top-full mt-2 px-3 py-1 text-xs text-black bg-white rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
      {name}
    </span>
  </div>
);

export default StackIcon;
