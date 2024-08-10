import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Notification } from "./notification.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column()
    email: string;
  
    @Column()
    phone: string;
  
    @Column('text', { array: true })
    subscribedCategories: string[];
  
    @Column('text', { array: true })
    channels: string[];
  
    @OneToMany(() => Notification, notification => notification.user)
    notifications: Notification[];
  }