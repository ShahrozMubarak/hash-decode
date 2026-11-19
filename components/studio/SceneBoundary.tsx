'use client';
import { Component, type ReactNode } from 'react';
import type { PosterModel } from './ModelPoster';

export default class SceneBoundary extends Component<{model:PosterModel,children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){
   return this.state.failed ? null : this.props.children;
 }
}
