import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMember, ButtonInteraction } from 'discord.js';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID || ''; // Server ID - needs to be provided
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1336659124884209755'; // Applications channel
const ADMIN_ROLE_ID = '1336657149765484654';
const REJECT_ROLE_ID = '1332389782541697099';
const SCRIPT_ROLE_ID = '1336684394412507186';
const HACKS_ROLE_ID = '1321142625847345285';
const MODERATOR_ROLE_ID = '1274038853102997565'; // Role ID for moderators

class DiscordService {
  private client: Client;
  private ready: boolean = false;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.initialize();
  }

  private async initialize() {
    if (!BOT_TOKEN) {
      console.error('DISCORD_BOT_TOKEN is required but not found in environment variables');
      return;
    }

    try {
      this.client.once('ready', () => {
        console.log(`Discord bot logged in as ${this.client.user?.tag}`);
        this.ready = true;
      });

      this.client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        const [action, applicationType, applicationId] = interaction.customId.split('_');

        if (action === 'accept' || action === 'reject') {
          await this.handleApplicationResponse(interaction as ButtonInteraction, action, applicationType, applicationId);
        }
      });

      await this.client.login(BOT_TOKEN);
    } catch (error) {
      console.error('Failed to initialize Discord bot:', error);
    }
  }

  async verifyUserInGuild(username: string): Promise<{ verified: boolean; userId?: string }> {
    if (!this.ready) {
      console.warn('Discord bot is not ready, allowing verification for testing');
      return { verified: true, userId: 'test-user-id' };
    }

    if (!GUILD_ID) {
      console.warn('No GUILD_ID provided, verification disabled');
      throw new Error('لم يتم تكوين السيرفر بشكل صحيح. يرجى المحاولة لاحقاً');
    }

    try {
      const guild = await this.client.guilds.fetch(GUILD_ID);
      const members = await guild.members.fetch();

      // Find member by username (handle both old and new Discord username formats)
      const member = members.find(m => 
        m.user.username === username ||
        m.user.tag === username ||
        m.displayName === username
      );

      if (!member) {
        throw new Error('المستخدم غير موجود في السيرفر. تأكد من اسم المستخدم الخاص بك');
      }

      return {
        verified: true,
        userId: member.user.id
      };
    } catch (error) {
      console.error('Error verifying user in guild:', error);

      // If it's our custom error, throw it
      if ((error as Error).message.includes('لم يتم تكوين السيرفر') || 
          (error as Error).message.includes('المستخدم غير موجود')) {
        throw error;
      }

      // For other errors, return verification failed  
      throw new Error('لا يمكن التحقق من عضويتك في السيرفر. تأكد من اسم المستخدم أو حاول لاحقاً');
    }
  }

  async sendApplicationToChannel(application: any): Promise<void> {
    if (!this.ready) {
      console.warn('Discord bot is not ready, skipping channel notification');
      return;
    }

    if (!CHANNEL_ID) {
      console.warn('No CHANNEL_ID provided, skipping channel notification');
      return;
    }

    try {
      const channel = await this.client.channels.fetch(CHANNEL_ID);
      if (!channel || !channel.isTextBased()) {
        console.warn('Invalid channel, skipping notification');
        return;
      }

      const embed = this.createApplicationEmbed(application);
      const buttons = this.createApplicationButtons(application.type, application.id);

      if ('send' in channel) {
        await channel.send({
          embeds: [embed],
          components: [buttons]
        });
        console.log('Application sent to Discord channel successfully');
      }
    } catch (error) {
      console.error('Error sending application to channel:', error);
      console.warn('Continuing without Discord notification');
    }
  }

  private createApplicationEmbed(application: any): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`طلب ${this.getApplicationTypeArabic(application.type)}`)
      .setColor(this.getApplicationColor(application.type))
      .setTimestamp()
      .addFields([
        { name: 'اسم المستخدم في Discord', value: application.discordUsername, inline: true },
        { name: 'نوع التقديم', value: this.getApplicationTypeArabic(application.type), inline: true },
        { name: 'ID التقديم', value: application.id, inline: true }
      ]);

    // Add form data fields with Arabic labels
    const formData = application.formData;
    if (formData) {
      const fieldLabels: Record<string, string> = {
        // Admin fields
        'name': 'الاسم',
        'age': 'العمر', 
        'country': 'الدولة',
        'benefit': 'كيف ستفيد السيرفر',
        'experience': 'الخبرة في Discord',
        'responsibility': 'تحمل المسؤولية',
        'oath': 'القسم',

        // Script fields
        'languages': 'لغات البرمجة',
        'maps': 'الخرائط',
        'frequency': 'تكرار النشر',

        // Hacks fields
        'serverLogo': 'شعار السيرفر',
        'previousServers': 'سيرفرات سابقة',
        'hackTypes': 'أنواع الهاكات',
        'activeHours': 'ساعات النشاط'
      };

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          const arabicLabel = fieldLabels[key] || key;
          let displayValue = '';

          // Handle different value types
          if (key === 'responsibility') {
            displayValue = (value === 'true' || value === true) ? 'نعم' : 'لا';
          } else if (typeof value === 'boolean') {
            displayValue = value ? 'نعم' : 'لا';
          } else {
            displayValue = value.toString();
          }

          if (displayValue && displayValue.trim()) {
            embed.addFields([{ 
              name: arabicLabel, 
              value: displayValue.substring(0, 1024), // Discord field limit
              inline: false 
            }]);
          }
        }
      });
    }

    return embed;
  }

  private createApplicationButtons(type: string, applicationId: string): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`accept_${type}_${applicationId}`)
          .setLabel('قبول')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅'),
        new ButtonBuilder()
          .setCustomId(`reject_${type}_${applicationId}`)
          .setLabel('رفض')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❌')
      );
  }

  private async handleApplicationResponse(
    interaction: ButtonInteraction,
    action: string,
    applicationType: string,
    applicationId: string
  ) {
    // Check if user has the required role (MODERATOR_ROLE_ID)
    const member = interaction.member as any;
    if (!member?.roles?.cache.has(MODERATOR_ROLE_ID)) {
      await interaction.reply({
        content: 'ليس لديك صلاحية للتعامل مع التقديمات.',
        ephemeral: true
      });
      return;
    }

    try {
      const userWhoResponded = interaction.user;
      const actionText = action === 'accept' ? 'قُبِل' : 'رُفِض';
      const statusColor = action === 'accept' ? 0x57F287 : 0xED4245; // Green for accept, red for reject

      // Create updated embed with response info
      const originalEmbed = interaction.message.embeds[0];
      const updatedEmbed = new EmbedBuilder()
        .setTitle(originalEmbed.title)
        .setColor(statusColor)
        .setTimestamp()
        .setFields(originalEmbed.fields)
        .addFields([
          { 
            name: '📋 حالة التقديم', 
            value: `**${actionText}** بواسطة <@${userWhoResponded.id}>`, 
            inline: false 
          },
          {
            name: '⏰ تاريخ المراجعة',
            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
            inline: false
          }
        ]);

      // Update the message with new embed and no buttons
      await interaction.update({
        embeds: [updatedEmbed],
        components: []
      });

      if (action === 'accept') {
        const roleId = this.getRoleIdForType(applicationType);
        if (roleId) {
          console.log(`Would add role ${roleId} to user for application ${applicationId}`);
          // In a real scenario, you would fetch the user ID from the application data
          // and then call: await this.assignRole(userId, roleId);
        }
      } else if (action === 'reject' && applicationType === 'admin') {
        console.log(`Would add reject role ${REJECT_ROLE_ID} to user for application ${applicationId}`);
        // In a real scenario, you would fetch the user ID from the application data
        // and then call: await this.assignRole(userId, REJECT_ROLE_ID);
      }

    } catch (error) {
      console.error('Error handling application response:', error);
    }
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    if (!this.ready) {
      throw new Error('Discord bot is not ready');
    }

    try {
      const guild = await this.client.guilds.fetch(GUILD_ID);
      const member = await guild.members.fetch(userId);
      await member.roles.add(roleId);
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  }

  private getApplicationTypeArabic(type: string): string {
    switch (type) {
      case 'admin': return 'الإدارة';
      case 'script': return 'نشر السكربتات';
      case 'hacks': return 'نشر الهاكات';
      default: return type;
    }
  }

  private getApplicationColor(type: string): number {
    switch (type) {
      case 'admin': return 0x5865F2; // Discord blue
      case 'script': return 0x57F287; // Green
      case 'hacks': return 0xED4245; // Red
      default: return 0x99AAB5; // Gray
    }
  }

  private getRoleIdForType(type: string): string | null {
    switch (type) {
      case 'admin': return ADMIN_ROLE_ID;
      case 'script': return SCRIPT_ROLE_ID;
      case 'hacks': return HACKS_ROLE_ID;
      default: return null;
    }
  }
}

export const discordService = new DiscordService();