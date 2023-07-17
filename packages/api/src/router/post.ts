import { router, publicProcedure, protectedProcedure } from "../trpc";
import { number, z } from "zod";
 
export const postRouter = router({
 
  all: publicProcedure.query(async({ ctx }) => {
   const workouts= await ctx.prisma.workoutCeleb.findMany();
     
    // const users = await clerkClient.users.getUser();  
    return workouts
  }),
  addWorkoutToUser: protectedProcedure.input(z.object({WorkoutCelebId:z.number().min(1)
      ,workoutName:z.string().min(1)})).mutation(async({ctx,input})=>{
    const workerId = ctx.auth.userId;

    const existingRecord = await ctx.prisma.userToWork.findFirst({
      where: {
        personId: workerId,
        WorkoutCelebId: input.WorkoutCelebId,
        WorkoutName: input.workoutName
        
      },
    });

    if (existingRecord) {
      // Handle the case when the record already exists
      // For example, you can return an error or perform some other action
      
      return "Already added";
    }
    const connection = await ctx.prisma.userToWork.create({
      data:{
        personId:workerId,
        WorkoutCelebId:input.WorkoutCelebId,
        WorkoutName: input.workoutName
      }

    });
    return "Workout id Added"
  }),
  getWorkoutData:protectedProcedure.input(z.object({workoutId:z.number().min(1)})).query(async({ctx,input})=>{
    const getWorkoutData = await ctx.prisma.workoutCeleb.findUnique({
      where: {id:input.workoutId},
      include:{
        routines:{
          include:{
            exercises:{
              include:{
                sets:true
              }
            }
          }
        },
        
      }
      
      
    })
  
   return(getWorkoutData)
  }),
  getWorkoutExercise:protectedProcedure.input(z.object(
  {  routineId:z.number()}
  )).query(async({ctx,input})=>{
    const getExercises = await ctx.prisma.exercise.findMany({
      where:{
        routineId:input.routineId
      },
      include:{
        sets:true
      }

    })
    return getExercises
  }),
   getWorkoutToUser:publicProcedure.query(async({ctx})=>
  {
    const workerId = ctx.auth.userId;
    const workoutsPersonal=ctx.prisma.userToWork.findMany({
      where:{
          personId:workerId !== null ? workerId : undefined
      }
    })
    return workoutsPersonal
    
  }),
  createPersonalSets:protectedProcedure.input(z.object({
    name:z.string(),
    personId:z.string(),
    SetId:z.number(),
    reps  : z.string(),
    weight :    z.string(),
    RestTime:   z.string(),
    RestType :  z.string(),
    exerciseId: z.number(),
    type:     z.string(),
    workoutCelebId:z.number()
})).mutation(async({ctx,input})=>{
    const userIdx = ctx.auth.userId;
    const  CheckifExists = await ctx.prisma.personalSets.findMany({
      where:{
        personId:userIdx,
        SetId:input.SetId
      }
    })
    if(CheckifExists){
      await ctx.prisma.personalSets.deleteMany({
        where:{
          personId:userIdx,
          SetId:input.SetId
        }
      })
    }
    const createPersonalSets = await ctx.prisma.personalSets.create({
      data:{
        name   :    input.name,
      personId  : userIdx,
       SetId     : input.SetId,
       reps      : input.reps,
      weight    : input.weight,
      RestTime  : input.RestTime,
    RestType  : input.RestType,
        

      exerciseId :input.exerciseId,
      WorkoutCelebId :input.workoutCelebId,
      type:input.type,
      }
    })

 return "personal Sets Created"
  }),
  findPersonalSets:protectedProcedure.input(z.object({personId:z.string(),
    workoutCelebId:z.number()
   })).query(async({ctx,input})=>{
    const userId = ctx.auth.userId
    const PersonalSets= await ctx.prisma.personalSets.findMany({
      where:{
        personId:userId,
        WorkoutCelebId:input.workoutCelebId
      }
    })
    return PersonalSets
  })
 
  
});
