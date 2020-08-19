import { Program } from './main';
import { log, severity } from './util';
import { Bot } from './bot';

export const client = new Bot();
const program = new Program();
program.addListeners();
program.start().catch(error => log(error, 'PROGRAM', severity.ERROR));