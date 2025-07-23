import React, { useState, useEffect } from "react";
import { useWriteContract, useReadContract } from "wagmi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/app/hooks/useDashboard";
import TaskCreation from "./section-createtasks";
import TaskCard from "./section-task";

const TasksList = () => {
  /*//////////////////////////////////////////////////////////////*/
  //                               HOOKS
  /*//////////////////////////////////////////////////////////////*/
  const [activeTab, setActiveTab] = useState("Active tasks");

  /*//////////////////////////////////////////////////////////////*/
  //                            CUSTOM HOOKS
  /*//////////////////////////////////////////////////////////////*/
  const {
    completeTask,
    cancelTask,
    releasePayment,
    activeTasks,
    completedTasks,
    canceledTasks,
    expiredTasks,
    isTaskCompleting,
    isTaskCanceling,
    releasePaymentInProgress
  } = useDashboard();

  /*//////////////////////////////////////////////////////////////*/
  //                           FUNCTIONS
  /*//////////////////////////////////////////////////////////////*/
  const activeTaskCount = activeTasks ? activeTasks.length : 0;
  const completedTaskCount = completedTasks ? completedTasks.length : 0;
  const canceledTaskCount = canceledTasks ? canceledTasks.length : 0;
  const expiredTaskCount = expiredTasks ? expiredTasks.length : 0;

  /*//////////////////////////////////////////////////////////////*/
  //                               JSX
  /*//////////////////////////////////////////////////////////////*/
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className='w-full flex-col justify-start bg-muted/70 p-6  rounded-2xl gap-6 min-h-[60vh]'
    >
      <div className='flex items-center justify-between  bg-muted/20'>
        <label htmlFor='view-selector' className='sr-only'>
          View
        </label>
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger
            className='flex w-fit @4xl/main:hidden'
            size='sm'
            id='view-selector'
          >
            <SelectValue placeholder='Select a view' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='Active tasks'>Active tasks</SelectItem>
            <SelectItem value='Completed tasks'>Completed tasks</SelectItem>
            <SelectItem value='Canceled tasks'>Canceled tasks</SelectItem>
            <SelectItem value='Expired tasks'>Expired Tasks</SelectItem>
          </SelectContent>
          
        </Select>
        <TabsList className='**:data-[slot=badge]:bg-muted-foreground/30 bg-background  hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex'>
          <TabsTrigger value='Active tasks'>
            Active tasks
            {activeTaskCount != 0 && (
              <Badge variant='secondary'>{activeTaskCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='Completed tasks'>
            Completed tasks
            {completedTaskCount != 0 && (
              <Badge variant='secondary'>{completedTaskCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='Canceled tasks'>
            Canceled tasks
            {canceledTaskCount != 0 && (
              <Badge variant='secondary'>{canceledTaskCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='Expired tasks'>
            Expired Tasks
            {expiredTaskCount != 0 && (
              <Badge variant='secondary'>{expiredTaskCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TaskCreation />
      </div>
      <div className=''>
        <TabsContent
          value='Active tasks'
          className='relative flex flex-col gap-4 overflow-auto px-4 lg:px-6'
        >
          {activeTasks
            ?.slice()
            .reverse()
            .map((task) => (
              <TaskCard
                key={task.id}
                {...task}
                completeTask={completeTask}
                cancelTask={cancelTask}
                isCompleting={isTaskCompleting(task.id)}
                isCanceling={isTaskCanceling(task.id)}
                releasePayment={releasePayment}
              />
            ))}
        </TabsContent>
        <TabsContent
          value='Completed tasks'
          className='relative flex flex-col gap-4 overflow-auto px-4 lg:px-6'
        >
          {completedTasks
            ?.slice()
            .reverse()
            .map((task) => (
              <TaskCard
                key={task.id}
                {...task}
                completeTask={completeTask}
                cancelTask={cancelTask}
                isCompleting={isTaskCompleting(task.id)}
                isCanceling={isTaskCanceling(task.id)}
                releasePayment={releasePayment}
              />
            ))}
        </TabsContent>
        <TabsContent
          value='Canceled tasks'
          className='relative flex flex-col gap-4 overflow-auto px-4 lg:px-6'
        >
          {canceledTasks
            ?.slice()
            .reverse()
            .map((task) => (
              <TaskCard
                key={task.id}
                {...task}
                completeTask={completeTask}
                cancelTask={cancelTask}
                isCompleting={isTaskCompleting(task.id)}
                isCanceling={isTaskCanceling(task.id)}
                releasePayment={releasePayment}
              />
            ))}
        </TabsContent>
        <TabsContent
          value='Expired tasks'
          className='relative flex flex-col gap-4 overflow-auto px-4 lg:px-6'
        >
          {expiredTasks
            ?.slice()
            .reverse()
            .map((task) => (
              <TaskCard
                key={task.id}
                {...task}
                completeTask={completeTask}
                cancelTask={cancelTask}
                releasePayment={releasePayment}
                isCompleting={isTaskCompleting(task.id)}
                isCanceling={isTaskCanceling(task.id)}
                isReleasing={releasePaymentInProgress(task.id)}
              />
            ))}
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default TasksList;