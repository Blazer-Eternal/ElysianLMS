import * as Sequelize from "sequelize";
import { VideoProviderEnum } from "../enums/videoProviderEnum";

export interface InputLessonInterface {
  sectionId: number;
  title: string;
  videoProvider?: VideoProviderEnum | null;
  videoRef?: string | null;
  content?: string | null;
  isPreview?: boolean;
  orderIndex: number;
}

export interface LessonInterface extends InputLessonInterface {
  id: number;
  videoProvider: VideoProviderEnum | null;
  videoRef: string | null;
  content: string | null;
  isPreview: boolean;
}

export interface LessonModelInterface
  extends Sequelize.Model<LessonInterface, InputLessonInterface>,
    LessonInterface {}
