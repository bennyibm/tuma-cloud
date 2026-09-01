import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplateCompilerService {
  /**
   * Compile une chaîne template Handlebars avec les variables fournies
   */
  compile(templateString: string, variables: Record<string, any> = {}): string {
    if (!templateString) return '';
    const compiled = Handlebars.compile(templateString);
    return compiled(variables);
  }

  /**
   * Génère un fallback texte brut à partir du HTML
   */
  generatePlainText(html: string): string {
    if (!html) return '';
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
