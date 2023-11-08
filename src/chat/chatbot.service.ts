import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';

@Injectable()
export class ChatbotService {
  private readonly intentClassifier: IntentClassifier;
  private readonly message: MessageService;
  private readonly userService: UserService;

  constructor(
    intentClassifier: IntentClassifier,
    message: MessageService,
    userService: UserService,
  ) {
    this.intentClassifier = intentClassifier;
    this.message = message;
    this.userService = userService;
  }

  public async processMessage(from: string, message: string): Promise<any> {
    const userData = await this.userService.findUserByMobileNumber(from);
    const { intent, entities } = this.intentClassifier.getIntent(message);
    if (intent === 'greeting') {
      this.message.sendWelcomeMessage(from, userData.language);
    } else if (intent === 'select_language') {
      const selectedLanguage = entities[0];
      const userData = await this.userService.findUserByMobileNumber(from);
      userData.language = selectedLanguage;
      await this.userService.saveUser(userData);
      this.message.sendLanguageChangedMessage(from, userData.language);
    }
    return 'ok';
  }
}

export default ChatbotService;
