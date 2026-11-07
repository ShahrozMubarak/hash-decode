'use client';
import {Component,type ReactNode} from 'react';
import ModelPoster,{type PosterModel} from './ModelPoster';
export default class SceneBoundary extends Component<{model:PosterModel,children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<div className="scene-surface"><ModelPoster model={this.props.model}/></div>:this.props.children;}
}
