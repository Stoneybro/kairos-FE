"use client"
import { useDashboard } from "@/app/hooks/useDashboard";
import { ChevronDownIcon, Loader2, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@uidotdev/usehooks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { PenaltyType } from "@/app/types/types";
import { Button } from "./ui/button";
import { SlNote } from "react-icons/sl";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "sonner";

const TaskCreation = () => {
  /*//////////////////////////////////////////////////////////////*/
  //                               HOOKS
  /*//////////////////////////////////////////////////////////////*/
  const [open, setOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("10:30");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  /*//////////////////////////////////////////////////////////////*/
  //                            CUSTOM HOOKS
  /*//////////////////////////////////////////////////////////////*/
  const {
    showCreateTask,
    setShowCreateTask,
    createTaskButton,
    setCreateTaskButton,
    taskDescription,
    setTaskDescription,
    rewardAmount,
    setRewardAmount,
    deadline,
    setDeadline,
    delayDuration,
    setDelayDuration,
    buddyAddress,
    setBuddyAddress,
    penaltyType,
    setPenaltyType,
    createTask,
    isDisabled,
    localSuccess
  } = useDashboard();

  /*//////////////////////////////////////////////////////////////*/
  //                           FUNCTIONS
  /*//////////////////////////////////////////////////////////////*/
  // Function to combine date and time into a single Date object
  const combineDateTime = (date: Date | undefined, timeString: string): Date | undefined => {
    if (!date) return undefined;
    
    // Validate time format before processing
    if (!timeString || !/^\d{1,2}:\d{2}$/.test(timeString)) {
      timeString = '10:30'; // fallback to default
    }
    
    const timeParts = timeString.split(':');
    if (timeParts.length !== 2) return date; // return original date if time is invalid
    
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    // Validate hours and minutes
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return date; // return original date if time values are invalid
    }
    
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    
    return combined;
  };

  // Handle date selection and combine with current time
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const combined = combineDateTime(date, selectedTime);
      setDeadline(combined);
    } else {
      setDeadline(undefined);
    }
    setIsDateOpen(false);
  };

  // Handle time change and combine with current date
  const handleTimeChange = (timeString: string) => {
    // Only update if we have a valid time format
    if (timeString && /^\d{2}:\d{2}$/.test(timeString)) {
      setSelectedTime(timeString);
      if (deadline) {
        const combined = combineDateTime(deadline, timeString);
        setDeadline(combined);
      }
    } else if (timeString === '') {
      // Handle empty string case - reset to default
      setSelectedTime('10:30');
      if (deadline) {
        const combined = combineDateTime(deadline, '10:30');
        setDeadline(combined);
      }
    }
    // For partial inputs during typing, just update the selectedTime
    // but don't crash if it's not a complete time
    if (timeString.length <= 5) {
      setSelectedTime(timeString);
    }
  };

  // Format time for display (ensure it's always HH:MM format)
  const formatTimeForInput = (time: string) => {
    if (!time || typeof time !== 'string') return '10:30';
    
    const parts = time.split(':');
    if (parts.length < 2) return '10:30';
    
    const [hours, minutes] = parts;
    if (!hours || !minutes) return '10:30';
    
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  useEffect(() => {
    if (createTaskButton == "Creating Task" && localSuccess) {
      setCreateTaskButton("Task Created");
      setTaskDescription("");
      setRewardAmount("");
      setDeadline(undefined);
      setDelayDuration("");
      setBuddyAddress("");
      setPenaltyType(PenaltyType.UNDEFINED);
      setSelectedTime("10:30"); // Reset time as well
      toast.success("Task Created Successfully");
      setOpen(false)
    }
  }, [localSuccess]);

  /*//////////////////////////////////////////////////////////////*/
  //                               JSX
  /*//////////////////////////////////////////////////////////////*/
  const deadlineJsx = (
    <div className='flex gap-4'>
      <div className='flex gap-3 w-full '>
        <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              id='date-picker'
              className='w-32 justify-between font-normal'
            >
              {deadline ? deadline.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
            <Calendar
              mode='single'
              selected={deadline}
              captionLayout='dropdown'
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
        
        <div className="flex flex-col gap-3 w-[40%]">
          <Input
            type="time"
            id="time-picker"
            value={formatTimeForInput(selectedTime)}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </div>
    </div>
  );

  const createTaskForm = (
    <div className='grid gap-4 px-4 lg:px-0'>
      {/* Task description */}
      <div className='grid gap-3'>
        <label htmlFor='TaskDescription'> Task Description</label>
        <Input
          id='TaskDescription'
          name='Task Description'
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder='Making a new task'
          required
        />
        {taskDescription && taskDescription.trim().length < 5 && (
          <p className='text-destructive text-sm -mt-3'>
            Description must be at least 5 characters.
          </p>
        )}
      </div>
      
      {/* Reward Amount */}
      <div className='grid gap-3 w-full'>
        <label htmlFor='RewardAmount'>Reward Amount (ETH)</label>
        <Input
          id='RewardAmount'
          name='Reward Amount'
          type='number'
          step='0.01'
          value={rewardAmount}
          onChange={(e) => setRewardAmount(e.target.value)}
          placeholder='0.01'
          required
          className='w-full'
        />
        {rewardAmount &&
          (!/^\d*\.?\d{0,18}$/.test(rewardAmount) ||
            parseFloat(rewardAmount) <= 0) && (
            <p className='text-destructive text-sm -mt-3'>
              Enter a valid amount.
            </p>
          )}
      </div>

      {/* Deadline with Date and Time */}
      <div className='grid gap-3'>
        <label htmlFor='deadline'>Deadline</label>
        {deadlineJsx}
        {deadline && deadline.getTime() <= Date.now() && (
          <p className='text-destructive text-sm -mt-3'>
            Deadline must be in the future.
          </p>
        )}
      </div>
      
      {/* Penalty Type */}
      <div className='grid gap-3'>
        <label htmlFor='penaltyType' className='text-sm font-medium'>
          Penalty Type
        </label>
        <RadioGroup
          className='flex items-center justify-between'
          onValueChange={(value) => {
            setPenaltyType(value as PenaltyType);
          }}
        >
          {/* Delay Payment */}
          <label
            htmlFor='DELAY_PAYMENT'
            className={`flex lg:p-3 p-2 w-[48%] gap-3 border-2 rounded-2xl items-center cursor-pointer transition ${
              penaltyType === PenaltyType.DELAY_PAYMENT
                ? "bg-muted border-primary"
                : "border-neutral-700"
            }`}
          >
            <RadioGroupItem
              value='DELAY_PAYMENT'
              id='DELAY_PAYMENT'
              className='mt-[2px]'
            />
            <div className='flex flex-col'>
              <span className='text-white font-medium'>Delay Payment</span>
              <span className='text-sm text-muted-foreground'>
                Delay payment by specified time.
              </span>
            </div>
          </label>

          {/* Send Buddy */}
          <label
            htmlFor='SEND_BUDDY'
            className={`flex lg:p-3 p-2 w-[48%] gap-3 border-2 transition rounded-2xl items-center cursor-pointer  ${
              penaltyType === PenaltyType.SEND_BUDDY
                ? "bg-muted border-primary"
                : "border-neutral-700"
            }`}
          >
            <RadioGroupItem
              value='SEND_BUDDY'
              id='SEND_BUDDY'
              className='mt-[2px]'
            />
            <div className='flex flex-col'>
              <span className='text-white font-medium'>Send Buddy</span>
              <span className='text-sm text-muted-foreground'>
                Sent to specified address.
              </span>
            </div>
          </label>
        </RadioGroup>
      </div>
      
      {/* Delay Duration and Buddy Address */}
      <div className=''>
        {penaltyType === PenaltyType.DELAY_PAYMENT && (
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Delay Duration (days)
            </label>
            <Input
              type='number'
              value={delayDuration}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*$/.test(v)) {
                  setDelayDuration(v);
                }
              }}
              onPaste={(e) => {
                if (!/^\d+$/.test(e.clipboardData.getData("text"))) {
                  e.preventDefault();
                }
              }}
              placeholder='30'
              className='w-full bg-[#1A1A1B] border-[#2A2A2A] border rounded-lg px-4 py-3 text-white'
            />
            {delayDuration &&
              (parseInt(delayDuration, 10) < 1 ||
                parseInt(delayDuration, 10) > 30) && (
                <p className='text-destructive text-sm '>
                  Enter a valid delay duration (1–30 days).
                </p>
              )}
          </div>
        )}

        {penaltyType === PenaltyType.SEND_BUDDY && (
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Buddy's Address
            </label>
            <Input
              type='text'
              value={buddyAddress}
              onChange={(e) => setBuddyAddress(e.target.value)}
              placeholder='0x...'
              className='w-full bg-[#1A1A1B] border-[#2A2A2A] border rounded-lg px-4 py-3 text-white'
            />
            {buddyAddress && !/^0x[a-fA-F0-9]{40}$/.test(buddyAddress) && (
              <p className='text-destructive text-sm '>
                Invalid Ethereum address.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <div className="">
        <Dialog open={open} onOpenChange={setOpen}>
          <form>
            <DialogTrigger asChild>
              <Button
                variant={"outline"}
                onClick={() => setShowCreateTask(!showCreateTask)}
                className='bg-background'
              >
                <SlNote className='' />
                Create New Task
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              {createTaskForm}
              <DialogFooter>
                <Button
                  type='submit'
                  variant={"default"}
                  disabled={isDisabled}
                  onClick={createTask}
                  className='w-full flex justify-center items-center'
                >
                  {createTaskButton === "Creating Task" && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {createTaskButton}
                </Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>
      </div>
    );
  }
  
  return (
    <div className=''>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant={"outline"}
            onClick={() => setShowCreateTask(!showCreateTask)}
            className='bg-background'
          >
            <SlNote className='' />
            Create New Task
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className='text-left'>
            <DrawerTitle>Create New Task</DrawerTitle>
          </DrawerHeader>
          {createTaskForm}
          <DrawerFooter className='pt-2'>
            <Button
              variant={"default"}
              disabled={isDisabled}
              onClick={createTask}
              className='w-full flex justify-center items-center mb-8 mt-4'
            >
              {createTaskButton === "Creating Task" && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {createTaskButton}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default TaskCreation;