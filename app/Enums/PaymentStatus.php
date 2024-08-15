<?php 

namespace App\Enums;

// use App\Traits\TranslateEnums;

enum PaymentStatus : string {
    // use TranslateEnums;

    case Pending = 'Pending';
    case Completed = 'Completed';
    case Partial = 'Partial';
    case Declined = 'Declined';

    public function color() : string {
        return match($this) {
            self::Pending => 'info',
            self::Partial => 'info',
            self::Completed => 'success',
            self::Declined => 'danger',
        };
    }

    public function icon() : string {
        return match($this) {
            self::Partial => 'heroicon-o-clock',
            self::Pending => 'heroicon-o-clock',
            self::Completed => 'heroicon-o-check-circle',
            self::Declined => 'heroicon-o-x-circle',
        };
    }
}