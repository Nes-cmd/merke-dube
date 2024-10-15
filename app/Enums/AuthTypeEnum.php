<?php 

namespace App\Enums;

enum AuthTypeEnum : string {
    case Phone = 'Phone';
    case Email = 'Email';
    case Invalid = 'Invalid';
}