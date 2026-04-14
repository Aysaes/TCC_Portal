<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminPasswordReset extends Notification
{
    use Queueable;
    public $token;
    /**
     * Create a new notification instance.
     */
    public function __construct($token)
    {
        $this->token = $token;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = route('password.reset-link', [
        'token' => $this->token,
        'email' => $notifiable->email
    ]);

        return (new MailMessage)
            ->subject('The CAT Clinic - Password Reset Required')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('An administrator has requested a password reset for your account.')
            ->action('Reset Password', $url)
            ->line('⏳ For your security, this link will expire in 60 minutes.')
            ->line('If you did not request this, please contact your administrator immediately.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
